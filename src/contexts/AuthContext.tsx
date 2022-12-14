import { createContext, ReactNode, useEffect, useState } from "react";
import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { api } from "../services/api";
WebBrowser.maybeCompleteAuthSession()

interface UserProps {
  name: string;
  avatarUrl: string;
}

export interface AuthContextDataProps {
  user: UserProps,
  isUserLoading: boolean,
  signIn: () => Promise<void>
}

interface AuthProviderProps {
  children: ReactNode
}

const storeUserData = async (user: UserProps) => {
  try {
    const jsonValue = JSON.stringify(user)
    await AsyncStorage.setItem('@nlw_user', jsonValue)
  } catch (e) {
    console.log('Error saving user: ', e)
  }
}

const getUserData = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem('@nlw_user')
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.log('Error getting user: ', e)
  }
}

export const AuthContext = createContext({} as AuthContextDataProps) 

export function AuthContextProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserProps>({} as UserProps)
  const [isUserLoading, setIsUserLoading] = useState(false)
  


  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: '217137005330-422p4ofeb919d5ohnk05m4nke7vj0n39.apps.googleusercontent.com',
    redirectUri: AuthSession.makeRedirectUri({ useProxy: true }),
    scopes: ['profile', 'email']
  })

  async function signIn() {
    try {
      setIsUserLoading(true)
      await promptAsync()
       
    } catch (error) {
      console.log(error)
      throw error;

    } finally {
      setIsUserLoading(false)
    }
  }

  async function signInWithGoogle(access_token: string) {
    try {
      setIsUserLoading(true)

      const tokenResponse = await api.post('/users', { access_token })
      api.defaults.headers.common['Authorization'] = `Bearer ${tokenResponse.data.token}`

      const userInfoResponse = await api.get('/me')
      
      setUser({
        avatarUrl: userInfoResponse.data.user?.avatarUrl,
        name: userInfoResponse.data.user?.name
      })

      storeUserData({
        avatarUrl: userInfoResponse.data.user?.avatarUrl,
        name: userInfoResponse.data.user?.name
      })

    } catch (error) {
      throw error
    } finally {
      setIsUserLoading(false)
    }
  }

  async function getUserFromStorage() {
    const userStorage:UserProps = await getUserData()
    if(userStorage.name){
      setUser(userStorage)
    }
  }

  useEffect(() => {
    if(response?.type === 'success' && response.authentication?.accessToken) {
      signInWithGoogle(response.authentication.accessToken)
    }

    // getUserFromStorage()
  }, [response])
   
  return (
    <AuthContext.Provider 
      value={{
        signIn,
        isUserLoading,
        user
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}