// eslint-disable-next-line import/no-anonymous-default-export
export default (initalState) => (state, action) => {
 switch (action.type) {
 case 'LOGIN':
   const newState = {
     auth: {
       isLoggedIn: true,
       user: action.user,
       admin: action.admin
     },
     admin: action.admin,
   };
   localStorage.setItem('citriot', JSON.stringify(newState));
   return newState;

 case 'LOGOUT':
   localStorage.removeItem('citriot');
   return {
     ...state,
     auth: {
       isLoggedIn: false,
       user: null
     },
     admin: false,
     logoutRedirect: action.redirectTo || "/login"
   };
  
 default:
   return initalState;
 }
};
