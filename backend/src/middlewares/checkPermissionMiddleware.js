import HttpException from "../utils/httpException.js";
import prisma from "../prisma/prismaClient.js";

const requireRole = (role) => {
    return async (req, res, next) => {
        const user = await prisma.user.findUnique({ where: { id: req.user.id } })

        if (user.role !== role) {
            throw new HttpException(403, `You need to have a ${role} role to access this endpoint.`)
        }

        return next();
    }
}

export default requireRole;
