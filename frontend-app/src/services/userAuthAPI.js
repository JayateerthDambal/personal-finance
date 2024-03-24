// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

// Defining a Base URl for Authentication and Registration Endpoints
export const userAuthAPI = createApi({
    reducerPath: 'userAuthAPI',
    baseQuery: fetchBaseQuery({ baseUrl: 'http://127.0.0.1:8000/api/user/' }),
    endpoints: (builder) => ({
        registerUser: builder.mutation({
            query: (user) => {
                return {
                    url: "register/",
                    method: "POST",
                    body: user,
                    headers: {
                        'Content-type': "application/json"
                    }
                }
            }
        }),
        loginUser: builder.mutation({
            query: (user) => {
                return {
                    url: "login/",
                    method: "POST",
                    body: user,
                    headers: {
                        'Content-type': "application/json"
                    }
                }
            }
        }),
        getLoggedUser: builder.query({
            query: (access_token) => {
                return {
                    url: "profile/",
                    method: "GET",
                    headers: {
                        'authorization': `Bearer ${access_token}`
                    }
                }
            }
        }),
        changeUserPassword: builder.mutation({
            query: ({ user_data, access_token }) => {
                return {
                    url: "change-password/",
                    method: "POST",
                    body: user_data,
                    headers: {
                        'authorization': `Bearer ${access_token}`
                    }
                }
            }
        }),
        getCustomerProfile: builder.query({
            query: (access_token) => {
                return {
                    url: "customer-profile/",
                    method: "GET",
                    headers: {
                        'authorization': `Bearer ${access_token}`
                    }
                }
            }
        }),

    }),
})

export const {
    useRegisterUserMutation, useLoginUserMutation,
    useGetLoggedUserQuery, useChangeUserPasswordMutation, useGetCustomerProfileQuery
} = userAuthAPI