import type { Request, Response } from "express";
import { RoleModel } from "../../models/role.model";

export class RoleController {
    async getData (request: Request, response: Response) {

        const data = await RoleModel
        .fetchAll().map((item: any) => {
            return {
                id      : item.id,
                name    : item.get('name'),
            }
        });

        return response.json({
            status  : 200,
            message : 'Success return data',
            data    : data
        })
    }
}
