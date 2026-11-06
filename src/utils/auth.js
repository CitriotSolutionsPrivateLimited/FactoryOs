
import axios from './axios';

export const login = async (username, password) => {
    try {
        const res = await axios.post('login', {
            username,
            password,
        });

        // if (res && res.data && res.data.user) {
        //     localStorage.setItem('user', res.data.user.username);

        //     return { data: { admin: true, user: res.data.user['username'] }, admin: res.data.admin, error: null };
        // }
        if (res && res.data && res.data.user) {
            const user = res.data.user;

            // ✅ Store in localStorage
            localStorage.setItem('user', user.username);
            localStorage.setItem('firstName', user.firstName);
            localStorage.setItem('crmId', user.crmId);
            localStorage.setItem('admin', user.admin);
            return {
                data: {
                    user: user.username,
                    admin: user.admin,
                    crmId: user.crmId
                },
                admin: user.admin,
                error: null
            };

        }
        else {
            return { error: 'User Not Authorized', data: null }
        }
    } catch (error) {
        return { data: null, error: error }
    }
};

export const logout = async() => {
    try {
      localStorage.clear();
    } catch (error) {
      localStorage.clear();
    } 
  };
  