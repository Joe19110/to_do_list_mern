import Users from "../models/users.js"

export const authAdmin = async (req, res, next) => {
    try {
        const user = await Users.findOne({ _id: req.user.id })
        // console.log(user)

        if (!user.role.includes(1) && !user.role.includes(3)) { // 1 = admin for app 1, 3 = admin for app 2, ...
            return res.status(403).json({ message: "Admin resources access denied." })
        }

        next()
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
}