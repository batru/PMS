import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";

//create a protect function
const protect = asyncHandler(async (req, res, next) => {
  const token = req.header("x-auth-token");

  if (!token) {
    return res.status(401).json({ msg: "access denied" });
  }
  try {
    //verify the token
    const decoded = jwt.verify(token, `${process.env.JWT_SECRET}`);
    //put the user in req.user
    // req.user = decoded.user;
    req.user = await User.findOne({
      attributes: { exclude: ["password"] },
      where: {
        id: decoded.id,
      },
    });
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
  // let token;
  // if (
  //   req.headers.authorization &&
  //   req.headers.authorization.startsWith("Bearer")
  // ) {
  //   try {
  //     //get token from header
  //     token = req.headers.authorization.split(" ")[1];
  //     //verify token so as to get user Id
  //     const decoded = await jwt.verify(token, process.env.JWT_SECRET);
  //     //GET USER FROM TOKEN
  //     //set the user to req.user
  //     req.user = await User.findOne({
  //       attributes: { exclude: ["password"] },
  //       where: {
  //         id: decoded.id,
  //       },
  //     });
  //     next();
  //   } catch (error) {
  //     console.log(error);
  //     res.status(401);
  //     throw new Error("Not authorized");
  //   }
  // }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }
});

//user must be admin
const admin = asyncHandler(async (req, res, next) => {
  //check if user is admin
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(401).json({ msg: "not authorized as admin" });
  }
});

export { protect, admin };
