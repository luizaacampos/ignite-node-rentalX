import { inject, injectable } from "tsyringe";
import { ICreateUserDTO } from "../../../dtos/ICreateUserDTO";
import { IUsersRepository } from "../../repositories/IUsersRepository";
import { hash } from 'bcryptjs';
import { AppError } from "../../../../errors/AppError";

@injectable()
class CreateUserUseCase {

    constructor(
        @inject("UsersRepository")
        private usersRepository: IUsersRepository,
    ) {}

    async execute({ 
        name,
        email, 
        driverslicense, 
        password 
    }: ICreateUserDTO): Promise<void> {

        const userAlreadyExists = await this.usersRepository.findByEmail(email);
        if (userAlreadyExists) {
            throw new AppError('User already exists!')
        }

        const passwordHash = await hash(password, 8);

        await this.usersRepository.create({
            name,
            email,
            password: passwordHash,
            driverslicense,
        })
    }
}

export{ CreateUserUseCase }