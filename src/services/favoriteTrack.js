import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { refreshToken } from "../api";
const DATA_TAG = ["LIST"];
export default function parseJwt(token) {
  let jsonPayload

  try {
    let base64Url = token.split('.')[1]
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        })
        .join('')
    )

    jsonPayload = JSON.parse(jsonPayload)
  } catch (e) {
    jsonPayload = {}
  }

  return jsonPayload
}
export const checkToken = async () => {
  const freshToken = localStorage.getItem('refreshToken')
  const accessToken = localStorage.getItem('token')
  const tokenParsed = parseJwt(accessToken)
  if (
    !freshToken ||
    Date.now() >= Number(parseJwt(freshToken)?.exp || 0) * 1000
  ) {
    localStorage.removeItem('token')

    return
  }
  if (!tokenParsed || Date.now() >= Number(tokenParsed?.exp || 0) * 1000) {

    const newToken = await refreshToken(freshToken)

    localStorage.setItem('token', newToken.access)
  }
 
  
}

export const getTokenAccess = () => {
  const accessToken = localStorage.getItem('token')

  return accessToken
}
const baseQuery = fetchBaseQuery({ baseUrl: 'https://skypro-music-api.skyeng.tech/catalog/' })

const baseQueryWithTokensCheck = async (args, api, extraOptions) => {
    await checkToken();

    let result = await baseQuery(args, api, extraOptions)
    if (result.error && result.error.status === 401) {
       localStorage.removeItem('token')
    }
    return result
}

export const favoriteTracksApi = createApi({
  reducerPath: `tracksAPI`,
  baseQuery: baseQueryWithTokensCheck,
  endpoints: (builder) => ({
    getMyTracks: builder.query({
      query:  () => {
       return {
        url: `track/favorite/all/`,
          headers: { Authorization: `Bearer ${getTokenAccess()}` },
        }
      },
      providesTags: [DATA_TAG],
      transformResponse: ( response, meta, arg) => {
         const transformedResponse = response.map((item ) => ({
          ...item,
          
         }));
        
         return transformedResponse;
     },
    }),
 

    likeTrack: builder.mutation({
      query(data) {
        const { id } = data

        return {
          url: `track/${id}/favorite/`,
          headers: { Authorization: `Bearer ${getTokenAccess()}` },
          method: 'POST',
        }
      },
      invalidatesTags: [DATA_TAG],

    }),

    dislikeTrack: builder.mutation({
      query: ({ id }) => ({
        url: `track/${id}/favorite/`,
        headers: { Authorization: `Bearer ${getTokenAccess()}` },
        method: 'DELETE',
      }),
      invalidatesTags: (post) => [{ type: DATA_TAG.type, id: post?.id }],
    }),
  }),
})

 
export const {
  useGetMyTracksQuery,
  useLikeTrackMutation,
  useDislikeTrackMutation,
} = favoriteTracksApi