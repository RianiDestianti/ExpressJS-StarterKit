import type { Request, Response } from "express";
import { hash } from "bcryptjs";
import Validator from "validatorjs";
import { UserModel } from "../../models/user.model";

export default class ProfileController {
    async getProfile (request: Request, response: Response) {
        const user = request.user

        if(!user) {
            return response.json({
                status  : 401,
                message : 'Token expired'
            })
        }

        const getUser   = await UserModel.where('id', user.id).fetch({ require: false })

        return response.json({
            status  : 200,
            message : 'Success return data user',
            data    : {
                ...user,
                verified    : getUser && getUser.get('verified_at') ? true : false
            }
        })
    }

    async action (request: Request, response: Response) {
        const body      = request.body ?? {}
        const authUser  = request.user

        let rules = {
            name        : 'required',
            password    : 'min:6'
        }

        let validation = new Validator(body , rules);
        if(validation.fails()){
            return response.json({
                status  : 422,
                message : 'Validation failed',
                data    : validation.errors.all()
            })
        }

        try {
            const user = await UserModel.where('id', authUser?.id).fetch({ require: false })
            if(!user) {
                return response.json({
                    status  : 404,
                    message : 'Data not found'
                })
            }

            user.set({
                name    : body.name,
                phone   : body.phone ?? user.get('phone'),
                avatar  : body.avatar ?? user.get('avatar'),
            })

            if(body.password) {
                user.set({ password : await hash(body.password, 10) })
            }

            await user.save()

            return response.json({
                status  : 200,
                message : 'Success saved data'
            })
        } catch (error: any) {
            return response.json({
                status  : 500,
                message : error?.message || 'Failed saved data'
            })
        }
    }
}
