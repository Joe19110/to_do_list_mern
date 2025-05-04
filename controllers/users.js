import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Users from '../models/users.js';
import { userSendMail } from './userSendMail.js';
import fetch from 'node-fetch';

const { DEFAULT_CLIENT_URL } = process.env

// user sign-up
export const signUp = async (req, res) => {
    try {
        const { personal_id, name, email, password, confirmPassword, address, phone_number, client_url } = req.body;

        if (!personal_id || !name || !email || !password || !confirmPassword) {
            return res.status(400).json({ message: "Please fill in all fields" });
        }

        if (name.length < 3) return res.status(400).json({ message: "Your name must be at least 3 letters long" });

        if (!isMatch(password, confirmPassword)) return res.status(400).json({ message: "Password did not match" });

        if (!validateEmail(email)) return res.status(400).json({ message: "Invalid emails" });

        if (!validatePassword(password)) {
            return res.status(400).json({
                message: "Password should be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letters"
            });
        }

        const existingUser = await Users.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "This email is already registered" });
        }

        if (existingUser && existingUser.status === 'inactive') {
            return res.status(403).json({ message: "Your account is inactive. Please contact admin to reactivate." });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = {
            personal_id,
            name,
            email,
            password: hashedPassword,
            address,
            phone_number
        };

        const activation_token = createActivationToken(newUser);

        // For testing only
        console.log("Activation token:", activation_token);

        const url = `${client_url || DEFAULT_CLIENT_URL}/activate/${activation_token}`;

        userSendMail(email, url, "Verify your email address", "Confirm Email");

        res.json({ message: "Register Success! Please activate your email to start" });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const getActivationToken = async (req, res) => {
    const { activation_token } = req.params;
    if (!activation_token) {
      return res.status(400).send('Invalid or expired token.');
    }
  
    try {
      const response = await fetch(`${DEFAULT_CLIENT_URL}/activation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ activation_token }),
      });
  
      if (req.accepts('html')) {
        return res.redirect(response.ok ? '/activation-success' : '/activation-failed');
      } else {
        return res.status(response.ok ? 200 : 400).json({
          message: response.ok ? "Fetching of activation token is successful. Automatically redirects to email activation (if testing, this is manual)" : "Fetching of activation token is unsuccessful"
        });
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal server error');
    }
};

// email activation
export const activateEmail = async (req, res) => {
    try {
      const { activation_token } = req.body;
  
      // Verify the activation token
      const decodedToken = jwt.verify(activation_token, process.env.ACTIVATION_TOKEN_SECRET);
  
      // Destructure user data from the decoded token
      const { personal_id, name, email, password, address, phone_number } = decodedToken;
  
      // Check if user already exists in the database
      const existingUser = await Users.findOne({ email });
  
      // If the user exists and is already activated, return an error message
      if (existingUser && existingUser.role.includes(0)) {
        return res.status(400).json({ message: "This email already exists." });
      }
  
      // If the user exists but isn't activated, activate the account
      if (existingUser) {
        if (!existingUser.role.includes(0)) {
          existingUser.role.push(0); // Assign role '0' to indicate activated user
          await existingUser.save();
        }
        return res.json({ message: "Account has been activated. Please login now!" });
      }
  
      // If the user does not exist, create a new account
      const newUser = new Users({
        personal_id,
        name,
        email,
        password,
        address,
        phone_number,
        role: [0], // Assign role '0' to indicate activated user
      });
  
      // Save the new user
      await newUser.save();
  
      // Respond with success message
      res.json({ message: "Account has been activated. Please login now!" });
  
    } catch (error) {
      console.error(error);
      // Handle any errors that occur during activation
      return res.status(500).json({ message: "Internal server error" });
    }
  };


// user sign-in
export const signIn = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await Users.findOne({ email })

        if (!email || !password) return res.status(400).json({ message: "Please fill in all fields" })

        if (!user) return res.status(400).json({ message: "Invalid Credentials" })

        if (user.status === 'inactive') {
            return res.status(403).json({ message: "Your account is inactive. Please contact admin to reactivate." });
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) return res.status(400).json({ message: "Invalid Credentials" })

        const roles = user.role;

        const refresh_token = createRefreshToken({ id: user._id })

        const expiry = 24 * 60 * 60 * 1000 // 1 day

        res.cookie('refreshtoken', refresh_token, {
            httpOnly: true,
            path: '/api/user/refresh_token',
            maxAge: expiry,
            expires: new Date(Date.now() + expiry)
        })

        // if user only has 1 role
        if (roles.length === 1) {
            res.json({
                message: `🖖Welcome, ${user.name}`,
                selectedRole: roles[0],
                userRoles: roles
            })
        } else {
            // if user has more than 1 roles
            res.json({
                message: "Please select your role.",
                roleSelectionRequired: true,
                role: roles,
                id: user._id
            })
        }
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

// select role
export const selectRole = async (req, res) => {
    try {
        const { userId, selectedRole } = req.body

        const user = await Users.findById(userId)

        if (!user) return res.status(404).json({ message: "User not found." })

        if (!user.role.includes(selectedRole)) {
            return res.status(400).json({ message: "Invalid role selection" })
        }

        res.json({
            message: `🖖Welcome, ${user.name}`,
            selectedRole,
            userRoles: user.role,
            id: user.id
        })

    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

// get access token
export const getAccessToken = async (req, res) => {
    try {
        const rf_token = req.cookies.refreshtoken

        if (!rf_token) return res.status(400).json({ message: "Please login now!" })

        jwt.verify(rf_token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
            if (err) return res.status(400).json({ message: "Please login now!" })

            const access_token = createAccessToken({ id: user._id })
            res.json({ access_token })
        })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

// forgot password
export const forgotPassword = async (req, res) => {
    try {
        const { email, client_url } = req.body
        const user = await Users.findOne({ email })

        if (!email) return res.status(400).json({ message: "Please fill your email" })

        if (!validateEmail(email)) return res.status(400).json({ message: "Invalid emails" })
        if (!user) return res.status(400).json({ message: "This email doesn't exist" })

        const access_token = createAccessToken({ id: user._id })
        const url = `${client_url || DEFAULT_CLIENT_URL}/reset/${access_token}`

        userSendMail(email, url, "Reset your account", "Reset Password")
        res.json({ message: "Please check your email for reset" })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

// reset password
export const resetPassword = async (req, res) => {
    try {
        const { password, confirmPassword } = req.body

        if (!validatePassword(password)) return res.status(400).json({ message: "Password should be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letters" })

        if (!isMatch(password, confirmPassword)) return res.status(400).json({ message: "Password did not match" })

        const passwordHash = await bcrypt.hash(password, 12)

        await Users.findOneAndUpdate({ _id: req.user.id }, {
            "password": passwordHash
        })

        res.json({ message: "Password successfully changed. Please login" })
    } catch (error) {
        return res.status(500).json({ message: error })
    }
}


// user information
export const getUserInfor = async (req, res) => {
    try {
        const userId = req.user.id
        const userInfor = await Users.findById(userId).select("-password")

        res.json(userInfor)
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

// get user infor by Id
export const getUserById = async (req, res) => {
    try {
        const user = await Users.findById(req.params.id).select("-password")

        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        res.json(user)
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

// get staff id for notification
export const getUserStaff = async (req, res) => {
    try {
        const staffUsers = await Users.find({ "role": { $in: [2] } }, "_id email").exec();

        if (!staffUsers || staffUsers.length === 0) {
            return res.status(404).json({ message: "No staff found." });
        }

        return res.status(200).json(staffUsers);
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

// get all user info
export const getAllUsersInfor = async (req, res) => {
    try {
        const page = parseInt(req.query.page) - 1 || 0
        const limit = parseInt(req.query.limit) || 10
        const search = req.query.search || ""
        let sort = req.query.sort || "name"
        const all = req.query.all === "true";

        let searchQuery = {};
        // Sort by field and order
        req.query.sort ? (sort = req.query.sort.split(",")) : (sort = [sort]);

        let sortBy = {};
        if (sort[1]) {
            sortBy[sort[0]] = sort[1];
        } else {
            sortBy[sort[0]] = "asc";
        }

        // Define a mapping for role strings to role numbers
        const roleMapping = {
            user: [0, 5],
            admin: [1, 3],
            staff: [2, 4]
        };


        // Check if search matches role strings
        const roleSearch = roleMapping[search.toLowerCase()];
        if (roleSearch !== undefined) {
            searchQuery["role"] = { $in: roleSearch };
        } else {
            searchQuery.$or = [
                { "personal_id": { $regex: search, $options: "i" } },
                { "name": { $regex: search, $options: "i" } },
                { "email": { $regex: search, $options: "i" } },
                { "address": { $regex: search, $options: "i" } },
                { "phone_number": { $regex: search, $options: "i" } },
            ];
        }

        // Fetch all users if `all` is true
        let users;
        if (all) {
            users = await Users.find(searchQuery)
                .select("-password")
                .lean();
        } else {
            users = await Users.find(searchQuery)
                .select("-password")
                .sort(sortBy)
                .skip(page * limit)
                .limit(limit)
                .lean();
        }

        const totalUsers = await Users.countDocuments(searchQuery);
        const totalPage = all ? 1 : Math.ceil(totalUsers / limit);

        const response = {
            totalUsers,
            totalPage,
            page: all ? 1 : page + 1,
            limit: all ? totalUsers : limit,
            users,
        };

        res.json(response);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


// update user info
export const updateUser = async (req, res) => {
    try {
        const { personal_id, user_image, name, email, password, confirmPassword, address, phone_number } = req.body

        if (password) {
            if (password && password !== confirmPassword) return res.status(400).json({ message: "Password did not match" });

            if (!validatePassword(password)) return res.status(400).json({ message: "Password should be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letters" })
        }

        if (name.length < 3) return res.status(400).json({ message: "Your name must be at least 3 letters long" })

        if (name === "") return res.status(400).json({ message: "Name cannot be empty" });

        const updateFields = {
            'personal_id': personal_id,
            'name': name,
            'email': email,
            'user_image': user_image,
            'address': address,
            'phone_number': phone_number,
        }

        if (password) {
            const passwordHash = await bcrypt.hash(password, 12)
            updateFields["personal_info.password"] = passwordHash
        }

        const updatedUser = await Users.findOneAndUpdate({ _id: req.user.id }, updateFields, { new: true })

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            updatedUser,
            message: 'Update user success'
        })

    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

// update user role
export const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body; // role is expected as an array
        const validRoles = [0, 1, 2]; // 0 = user, 1 = admin, 2 = staff

        // Validate user role
        if (!Array.isArray(role) || role.some(r => !validRoles.includes(r))) {
            return res.status(400).json({ message: "Invalid user role" });
        }

        if (role.length > 3) {
            return res.status(400).json({ message: "User can only have a maximum of 3 roles" });
        }

        // Find the user by ID
        const user = await Users.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Get current roles from the user
        let currentRoles = user.role;

        // Combine current and new roles, then remove duplicates
        let updatedRoles = [...role];

        // Remove duplicates (e.g. [1, 0, 0] becomes [1, 0])
        updatedRoles = Array.from(new Set(updatedRoles));

        // Handle if the updated role contains duplicates like [0,0] or [1,1,1]
        if (updatedRoles.length === 1 && role.every(r => r === updatedRoles[0])) {
            // If all roles in request are the same, return a single element (e.g. [0,0,0] becomes [0])
            updatedRoles = [updatedRoles[0]];
        }

        // If the updated roles have fewer items than current roles, replace only the provided indexes
        for (let i = 0; i < role.length; i++) {
            currentRoles[i] = role[i];
        }

        // Remove duplicates in the final currentRoles if necessary
        currentRoles = Array.from(new Set(currentRoles));

        // Save back to database
        user.role = currentRoles;
        const updatedUser = await user.save();

        res.json({ message: "Update user role success", role: updatedUser.role });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// update user status
export const updateUserStatus = async (req, res) => {
    try {
        const { status } = req.body

        const validStatuses = ['active', 'inactive'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid user status" });
        }

        const updatedUser = await Users.findOneAndUpdate({ _id: req.params.id }, {
            "status": status
        }, { new: true })

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" })
        }

        res.json({ message: "User status updated" })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

export const logout = async (req, res) => {
    try {
        res.clearCookie('refreshtoken', { path: 'api/user/refresh_token' })
        return res.json({ message: "Logged out success" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// validate email
function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

// validate password
function validatePassword(password) {
    const re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/
    return re.test(password)
}

// check password and confirmPassword
function isMatch(password, confirm_password) {
    if (password === confirm_password) return true
    return false
}

// create refresh token
function createRefreshToken(payload) {
    return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '1d' })
}

function createAccessToken(payload) {
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '3m' })
}

function createActivationToken(payload) {
    return jwt.sign(payload, process.env.ACTIVATION_TOKEN_SECRET, { expiresIn: '3m' })
}




