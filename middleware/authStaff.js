import Users from "../models/users.js";

export const authStaff = async (req, res, next) => {
    try {
        const user = await Users.findOne({ _id: req.user._id });

        if (!user.role.includes(2) || !user.role.includes(4)) { // 2 = staff for app 1, 4 = staff for app 2, ...
            return res.status(403).json({ message: "Staff resources access denied." });
        }

        next();
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};