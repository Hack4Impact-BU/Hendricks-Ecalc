// Using DTOS file to represent the types needed for when the data is transfer from client to server
// or any method of data transfer

export interface CreateUserDto {
  username: string,
  email: string,
  password: string
}