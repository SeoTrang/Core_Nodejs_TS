import { UserRole } from '@interfaces/permissions.interface';
import { User } from '@interfaces/user.interface';
import { AuthService } from '@services/auth.service';
import { BcryptService } from '@services/bcrypt.service';
import { NodeMailService } from '@services/nodeMailService.service';
import { OTPService } from '@services/OPT.service';
import { UserService } from '@services/user.service';
import userRoleService from '@services/userRole.service';
import { Router, Request, Response, NextFunction } from 'express';
import { BadRequestError, ConflictError, ErrorMessage, NotFoundError } from 'src/core/errors/error.response';

class AuthController {
    async register (req: Request, res: Response, next: NextFunction) : Promise<void>  {
        try {
            // addressService.getAll();
            // console.log(req.body);
            let user: Partial<User> = req.body;
            if(!user.email || !user.password) {
                throw new BadRequestError('missing data');
            }
            if(user.email){
                let user_temp = await UserService.findByEmail(user.email);
                // console.log(user_temp);
                if(user_temp){
                    throw new ConflictError('email already exists');
                } 
            }

            // console.log("test 123");
            const listAvatar = [
                '/img/avatar_default/avatar_default.jpg',
                '/img/avatar_default/avatar_1.jpg',
                '/img/avatar_default/avatar_2.jpg',
                '/img/avatar_default/avatar_3.jpg',
                '/img/avatar_default/avatar_4.jpg',
                '/img/avatar_default/avatar_5.jpg',
                '/img/avatar_default/avatar_6.jpg',
                '/img/avatar_default/avatar_7.jpg',
                '/img/avatar_default/avatar_8.jpg',
                '/img/avatar_default/avatar_9.jpg',
                '/img/avatar_default/avatar_10.jpg',
                '/img/avatar_default/avatar_11.jpg',
                '/img/avatar_default/avatar_12.jpg',
                '/img/avatar_default/avatar_13.jpg',
                '/img/avatar_default/avatar_14.jpg',
                '/img/avatar_default/avatar_15.jpg',
                '/img/avatar_default/avatar_16.jpg',
                '/img/avatar_default/avatar_17.jpg',
                '/img/avatar_default/avatar_18.jpg',
                '/img/avatar_default/avatar_19.jpg',
                '/img/avatar_default/avatar_20.jpg',
                '/img/avatar_default/avatar_21.jpg',
                '/img/avatar_default/avatar_22.jpg',
                '/img/avatar_default/avatar_23.jpg',
                '/img/avatar_default/avatar_24.jpg',
            ]
            // Generate a random index within the range of the array length
            const randomIndex = Math.floor(Math.random() * listAvatar.length);

            // Get the random avatar URL using the random index
            // const randomAvatar = listAvatar[randomIndex];
            const randomAvatar = '/img/avatar_default/avatar_1.jpg';

            // const encodePass = await BcryptService.hash(user?.password);
            const encodePass = user?.password;
            if(!encodePass) throw new Error('Error encoding pass');
            user.password = encodePass;
            user.avatar = randomAvatar;

            await UserService.create(user);
            res.status(200).json('success');
            return
        } catch (error: any) {
            next(error);
        }
    }

    async login (req: Request, res: Response, next: NextFunction) : Promise<void>{
        try {
            const data: Partial<User> = req.body;
            console.log(data);
            if(!data.email || !data.password) throw new Error('Missing email or password')
            const user : User = await UserService.findByEmail(data.email);
            
            if(!user) {
                throw new NotFoundError('User not found')
            }
            if(!user.verifyEmail) {
                throw new BadRequestError('email is not verify');
            }
                
            if(!await BcryptService.compare(data.password,user.password)) {
                throw new BadRequestError('email or pass invalid');
            }
            let accessToken: string | null;
            let refreshToken: string | null;
            let userRoles : UserRole[] = await userRoleService.getPmsFromUserId(user.id);
            let userRoleIds = userRoles.map(role => role.role_id);

            accessToken = await AuthService.generateAccessToken(user,userRoleIds );
            refreshToken = await AuthService.generateRefreshToken(user, userRoleIds);
            if(refreshToken && accessToken){
              
                // const resultAddRefreshToken = refreshTokenService.create(data);
                 res.status(200).json({
                    refreshToken:refreshToken,
                    accessToken:accessToken
                })

                return
            }
             res.status(500).json('server error');
             return
        } catch (error) {
             next(error);
        }
    }

    async logout(req: Request, res: Response): Promise<any> {
        try {
            const authorizationHeader = req.headers.authorization;
            
            // Kiểm tra xem header authorization có tồn tại không
            if (!authorizationHeader) {
                return res.status(400).json('Authorization header is missing');
            }
    
            // Tách refreshToken từ header Authorization
            const refreshToken = authorizationHeader.split(' ')[1];
    
            // Tiến hành các xử lý sau đó
            return res.status(200).json('success');
        } catch (error) {
            console.log(error);
            return res.status(500).json('Server error');
        }
    }
    

    async sendEmail (req: Request,res: Response, next: NextFunction) : Promise<any>{
        try {
            const otp = Math.floor(1000 + Math.random() * 9000);
            const email = req.body.email;
            if(!email) throw new BadRequestError('email is required');
            const result_send_email = await NodeMailService.sendMail(email,otp);
            if(result_send_email){
                await OTPService.create({
                    email: email,
                    otp: otp.toString()
                })
            }
            return res.status(200).json('success');
        } catch (error: any) {
            next(error);
        }
    }

     async verifyEmail (req: Request,res: Response, next: NextFunction) : Promise<any> {
        try {
            const email = req.body.email;
            const otp = req.body.otp;
            if(!email || !otp) throw new BadRequestError('email or otp is required');
            const result = await OTPService.getByEmailAndNotExpired({email: email, otp: otp});
            console.log(result);
            if(result) {
                OTPService.deleteOTP({email: email, otp: otp})
                const user = await UserService.findByEmail(email);  
                if(!user) return res.status(404).json({error:'user not found'});
                await UserService.update(user.id,{verifyEmail: 1});
                return res.status(200).json(result);
            }else{
                throw new NotFoundError('User not found');
            }
                
            
        } catch (error) {
            next(error);
        }
    }

    async forgotPassword (req: Request,res: Response, next: NextFunction): Promise<any> {
        try {
            const {email, password} = req.body;
            if(!email || !password) throw new BadRequestError('email or password is required');
            const encodePass = await BcryptService.hash(password);
           
            const user = await UserService.findByEmail(email);  
            if(!user || !encodePass) throw new Error('error updating password')
            const result = await UserService.update(user.id,{password: encodePass});
        
            if (result) {
                return res.status(200).json({ message: 'Password updated successfully', result });
            } else {
                throw new NotFoundError('Password update failed');
            }
        } catch (error: any) {
            next(error);
        }
    }
}

export default new AuthController();