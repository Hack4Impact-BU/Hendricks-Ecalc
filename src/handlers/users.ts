import { Request, Response } from "express";

export function getUsers(req:Request, res:Response) {
  res.send('wow the route works for getUsers!')
}

export function getUserById(req:Request, res:Response) {
  res.send('wow the route works for getUserById!')
}