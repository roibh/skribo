 
 interface IUser {
    FirstName: string
    LastName: string;
    Email:string;
    _id: string;

}

 class User {

    static user: IUser;




    public static getUser(): IUser {
        if (this.user)
            return this.user;

        else {
            var userStr = localStorage.getItem('juntasuser');
            var user: any;
            if (userStr) {
                user = JSON.parse(userStr);


            }
            this.user = user;
            return user;
        }
    }
}