import { User } from '@interfaces/user.interface';
import jwt from 'jsonwebtoken';



export class AuthService {
    // Implement JWT authentication logic here
    async generateAccessToken(user: Partial<User>): Promise<string | null> {
        try {
            return jwt.sign(
                { id: user.id, roles: user.roles },
                process.env.ACCESS_TOKEN_SECRET as string,
                { expiresIn: "1d" }
            );
        } catch (error : any) {
            console.log(error.message);
            return null;
        }
    }

    async generateRefreshToken(user: Partial<User>): Promise<string | null> {
        try {
            return jwt.sign(
                { id: user.id, roles: user.roles }, // Sửa `user.Role` thành `user.role` cho nhất quán
                process.env.REFRESH_TOKEN_SECRET as string,
                { expiresIn: 60 * 60 }
            );
        } catch (error: any) {
            console.log(error.message);
            return null;
        }
    }

    async refreshTokenCreateNewAccessToken(refreshToken: string): Promise<string | null> {
        // Verify the refresh token
        try {
            const decoded = await this.verifyRefreshToken(refreshToken);

            if (decoded === "jwt expired") return decoded;

            // Generate a new access token using the decoded user information from the refresh token
            const user: Partial<User> = {
                id: decoded.id,
                roles: decoded.roles,
            };
            const accessToken = await this.generateAccessToken(user) ;
            // Return the new access token
            return accessToken;
        } catch (err) {
            // Handle the error, such as by returning an error response or redirecting to a login page
            console.error(err);
            return null;
        }
    }

    async verifyAccessToken(token: string): Promise<any | null> {
        try {
            // Verify the token using the secret key
            const decoded = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string);
            return decoded; // Return the decoded token data
        } catch (err : any) {
            console.error(err);
            if (err.message === "jwt expired") return err.message;
            return null; // Return null if token is not valid or has expired
        }
    }

    async verifyRefreshToken(token: string): Promise<any | null> {
        try {
            // Verify the token using the secret key
            const decoded = await jwt.verify(token, process.env.REFRESH_TOKEN_SECRET as string);
            return decoded; // Return the decoded token data
        } catch (err: any) {
            console.error(err);
            if (err.message === "jwt expired") return err.message;
            return null; // Return null if token is not valid or has expired
        }
    }
}
