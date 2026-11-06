import { useContext } from 'react';
import { RootContext } from '../context/RootContext';

export default function useAuth() {
 const { auth, dispatch } = useContext(RootContext);

 if (auth.isLoggedIn) { // this is only available is user has not refereshed the page
   return true;
 } else { // if user hits URL directly in browser, then need to check auth state from session storage
   let sessionFdState = localStorage.getItem('citriot');
   if (sessionFdState) {
     sessionFdState = JSON.parse(sessionFdState);
     const { auth: { user }, admin } = sessionFdState;
     dispatch({ type: 'LOGIN', user, admin });
     return true;
   } else {
     return false;
   }
 }
};
