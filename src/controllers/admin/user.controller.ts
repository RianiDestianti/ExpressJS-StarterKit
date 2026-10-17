import type { Request, Response } from "express";
import Validator from "validatorjs";
import { hash } from "bcryptjs";
import type Knex from "knex";
import { UserModel } from "../../models/user.model";

export class UserController {
    async getData (request: Request, response: Response) {
        const { page = "1", limit = "10", keyword = "", role = "" } = request.query as Record<string, string>;
        const offset = (parseFloat(page) - 1) * parseFloat(limit);

        const result = await UserModel.query((qb: Knex.QueryBuilder) => {
            qb.orderBy('created_at', 'DESC')
            if (keyword) {
                qb.where(function (this: Knex.QueryBuilder) {
                this.where('name', 'like', `%${keyword}%`)
                    .orWhere('email', 'like', `%${keyword}%`)
                    .orWhere('phone', 'like', `%${keyword}%`)
                });
            }

            if (role) {
                qb.where('role_id', role)
            }
        })
        .fetchPage({
            limit       : parseFloat(limit),
            offset,
            withRelated : ['role']
        });

        let users = result.map((item: any) => {
            return {
                id      : item.id,
                name    : item.get('name'),
                phone   : item.get('phone'),
                email   : item.get('email'),
                avatar  : item.get('avatar'),
                role    : item.related('role')?.get('name')
            }
        })

        const totalPages = Math.ceil(result.pagination.rowCount / parseFloat(limit))

        return response.json({
            status  : 200,
            message : 'Success return data user',
            data    : {
                data        : users,
                page        : parseFloat(page),
                limit       : parseFloat(limit),
                total       : {
                    pages   : totalPages,
                    data    : result.pagination.rowCount
                },
            }
        })
    }

    async actionData (request: Request, response: Response) {
        const body = request.body ?? {}
        const id   = body.id ?? 0

        let rules = {
            name        : 'required',
            email       : 'required|email',
            role        : 'required',
            password    : id ? 'min:6' : 'required|min:6',
        }

        let validation = new Validator(body , rules);
        if(validation.fails()){
            return response.json({
                status  : 422,
                message : 'Validation failed',
                data    : validation.errors.all()
            })
        }

        const checkEmail = await UserModel.where('email', body.email).where('id', '!=', id).fetch({ require: false })
        if(checkEmail) {
            return response.json({
                status  : 422,
                message : 'The email has been registered',
                data    : {
                    email : ['The email has been registered']
                }
            })
        }

        try {
            const data = await UserModel.where('id', id).fetch({ require: false })

            if(data){

                data.set({
                    name        : body.name,
                    email       : body.email,
                    phone       : body.phone ?? null,
                    role_id     : body.role,
                });

                if(body.password) {
                    data.set({ password : await hash(body.password, 10) })
                }

                await data.save();
            }else{

                await new UserModel({
                    name        : body.name,
                    email       : body.email,
                    phone       : body.phone ?? null,
                    role_id     : body.role,
                    password    : await hash(body.password, 10),
                    avatar      : `https://ui-avatars.com/api/?format=png&name=${encodeURIComponent(body.name)}`,
                    verified_at : new Date(),
                }).save()
            }

            return response.json({
                status  : 200,
                message : 'Success saved data'
            })
        }catch (error : any) {
            return response.json({
                status  : 500,
                message : error?.message || 'Failed saved data'
            })
        }
    }

    async getDetail (request: Request, response: Response) {
        const id        = request.params.id

        const tmpData   = await UserModel.where('id', id).fetch({ require: false, withRelated: ['role'] })
        if(tmpData) {

            const data  = {
                ...tmpData.toJSON({ omitPivot: true }),
                role    : tmpData.get('role_id'),
                roleName: tmpData.related('role')?.get('name'),
            }

            return response.json({
                status  : 200,
                message : 'Success return detail data',
                data    : data
            })
        }else{
            return response.json({
                status  : 404,
                message : 'Data not found'
            })
        }
    }

    async deleteData (request: Request, response: Response) {
        const id        = request.params.id

        const data = await UserModel.where('id', id).fetch({ require: false })
        if(data){

            await data.destroy()

            return response.json({
                status  : 200,
                message : 'Success delete data'
            })
        }else{
            return response.json({
                status      : 404,
                message     : 'Data not found'
            })
        }
    }
}
