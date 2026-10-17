import { Router } from "express";
import { adminOnly, authMiddleware } from "../middleware/auth.middleware";
import { UserController } from "../controllers/admin/user.controller";
import { RoleController } from "../controllers/admin/role.controller";

const admin = Router()

const userController        = new UserController()
const roleController        = new RoleController()

admin.get('/roles' , authMiddleware , adminOnly , roleController.getData)

admin.get('/users' , authMiddleware , adminOnly , userController.getData)
admin.post('/user/action' , authMiddleware , adminOnly , userController.actionData)
admin.get('/user/:id' , authMiddleware , adminOnly , userController.getDetail)
admin.get('/user/delete/:id' , authMiddleware , adminOnly , userController.deleteData)

export default admin
