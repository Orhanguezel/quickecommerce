
export interface CustomError {
    response: {
        data: {
            message: string;
        };
    };
}

export interface Subscribe {
    email: string;
}