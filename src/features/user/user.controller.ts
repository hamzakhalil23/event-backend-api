import { Request, Response } from "express";
import { prisma } from "../../lib/db";
import { hashPassword } from "../../utils/hash";

export async function createUser(req: Request, res: Response): Promise<void> {
  try {
    const { name, email, password, phoneNumber, role } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        error: "name, email and password are required",
      });
      return;
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(409).json({
        success: false,
        error: "User with this email already exists",
      });
      return;
    }

    const hashedPassword = await hashPassword(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phoneNumber: phoneNumber || null,
        role: role || "attendee",
      },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        role: true,
        emailVerified: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(201).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Create user error:", error);

    res.status(500).json({
      success: false,
      error: "Failed to create user",
    });
  }
}

export async function getUsers(req: Request, res: Response): Promise<void> {
  try {
    const { query, page = "1", limit = "10" } = req.query;

    const pageNumber = Number(page) || 1;
    const pageSize = Number(limit) || 10;
    const skip = (pageNumber - 1) * pageSize;

    const where: any = {};

    if (query) {
      where.OR = [
        {
          name: {
            contains: query as string,
            mode: "insensitive",
          },
        },
        {
          email: {
            contains: query as string,
            mode: "insensitive",
          },
        },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          name: true,
          email: true,
          phoneNumber: true,
          role: true,
          emailVerified: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
          profile: true,
          address: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: users,
      meta: {
        page: pageNumber,
        limit: pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("Get users error:", error);

    res.status(500).json({
      success: false,
      error: "Failed to fetch users",
    });
  }
}

export async function getUserById(req: Request, res: Response): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.params.id as string,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        role: true,
        emailVerified: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        profile: true,
        address: true,
        myList: {
          include: {
            session: true,
          },
        },
      },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        error: "User not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get user by id error:", error);

    res.status(500).json({
      success: false,
      error: "Failed to fetch user",
    });
  }
}

export async function updateUser(req: Request, res: Response): Promise<void> {
  try {
    const existingUser = await prisma.user.findUnique({
      where: {
        id: req.params.id as string,
      },
    });

    if (!existingUser) {
      res.status(404).json({
        success: false,
        error: "User not found",
      });
      return;
    }

    const {
      name,
      email,
      password,
      phoneNumber,
      role,
      emailVerified,
      isActive,
      lastLoginAt,
      addressId,
    } = req.body;

    const data: any = {};

    if (name !== undefined) data.name = name;
    if (email !== undefined) data.email = email;
    if (password !== undefined)
      data.password = await hashPassword(password, 10);
    if (phoneNumber !== undefined) data.phoneNumber = phoneNumber;
    if (role !== undefined) data.role = role;
    if (emailVerified !== undefined) data.emailVerified = emailVerified;
    if (isActive !== undefined) data.isActive = isActive;
    if (lastLoginAt !== undefined)
      data.lastLoginAt = lastLoginAt ? new Date(lastLoginAt) : null;
    if (addressId !== undefined) data.addressId = addressId || null;

    const user = await prisma.user.update({
      where: {
        id: req.params.id as string,
      },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        role: true,
        emailVerified: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        profile: true,
        address: true,
      },
    });

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Update user error:", error);

    res.status(500).json({
      success: false,
      error: "Failed to update user",
    });
  }
}

export async function deleteUser(req: Request, res: Response): Promise<void> {
  try {
    const existingUser = await prisma.user.findUnique({
      where: {
        id: req.params.id as string,
      },
    });

    if (!existingUser) {
      res.status(404).json({
        success: false,
        error: "User not found",
      });
      return;
    }

    await prisma.user.delete({
      where: {
        id: req.params.id as string,
      },
    });

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);

    res.status(500).json({
      success: false,
      error: "Failed to delete user",
    });
  }
}
