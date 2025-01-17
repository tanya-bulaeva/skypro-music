import * as S from "./style.js";
import { formatTime } from "../../helpers.js";
import {  resetState, pagePlaylists, setTrackCurrent } from "../../store/actions/creators/index.js";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { isTrackPlayingSelector,  pagePlaylistSelector,  tracksSelectors } from "../../store/selectors/index.js";

import { useNavigate } from "react-router-dom";
import { useDislikeTrackMutation, useGetMyTracksQuery, useLikeTrackMutation } from "../../services/favoriteTrack.js";
import { useUserContext } from "../../context/user.jsx";
export function Tracklists({ track }){
const {user} = useUserContext()
const dispatch = useDispatch()
const tracklist = useSelector(pagePlaylistSelector)
const selectedTrack = useSelector(tracksSelectors)
const isPlaying = useSelector(isTrackPlayingSelector)
const isCurrentPlaying = selectedTrack?.id !== track.id
const navigate = useNavigate()
  const isUserLike = Boolean(track.stared_user  ?  (track.stared_user?.find((track) => track?.id === user.id)) : true)
 const [isLiked, setIsLiked] = useState(isUserLike)
  const [likeTrack, ] = useLikeTrackMutation()
  const [dislikeTrack, ] = useDislikeTrackMutation()

  useEffect(() => {
    setIsLiked(isUserLike)
  }, [isUserLike ])
  const { data } = useGetMyTracksQuery()

  

  
  const handleLike = async (id) => {
    setIsLiked(true)
    try {
      await likeTrack({ id }).unwrap() 

      const originalPlaylist = tracklist;
      const item = originalPlaylist?.find((elem) => elem.id === id)
      item.stared_user.push(user)
      dispatch(pagePlaylists(originalPlaylist))
    } catch (error) {
      if (error.status == 401) {
        navigate('/login')
        dispatch(resetState())
      }
    }
  }

  const handleDislike = async (id) => {
    setIsLiked(false)
    try {
      await dislikeTrack({ id }).unwrap()

      const originalPlaylist = tracklist;
      const item = originalPlaylist?.find((elem) => elem.id === id)
      const index = item.stared_user.findIndex((i) => i.id === user.id)
      item.stared_user.splice(index, 1)
      dispatch(pagePlaylists(originalPlaylist))
    } catch (error) {
      if (error.status == 401) {
        navigate('/login')
        dispatch(resetState())
      }
    }
  }

  const toggleLikeDislike = (id) => isLiked ? handleDislike(id) : handleLike(id)

  return (
  <S.PlaylistItem >
  <S.PlaylistTrack>
    <S.TrackTitle>
         <S.TrackTitleImage>
{isCurrentPlaying ?  (<S.TrackTitleSvg alt="music">  <use xlinkHref="/img/icon/sprite.svg#icon-note"></use></S.TrackTitleSvg>):

( isPlaying ? (<S.BlinkingDotActive/>) : (<S.BlinkingDot/>) )
}
      </S.TrackTitleImage>

 <S.TrackTitleText>
        <S.TrackTitleLink  onClick={() =>  {dispatch(setTrackCurrent(track))}}> {track.name}
          <S.TrackTitleSpan>{track.trackTitle}</S.TrackTitleSpan></S.TrackTitleLink>
      </S.TrackTitleText>

    </S.TrackTitle>

<S.TrackAuthor>
      <S.TrackAuthorLink >{track.author}</S.TrackAuthorLink>
    </S.TrackAuthor>

 <S.TrackAlbum  >
      <S.TrackAlbumLink href="http://"
        > {track.album}</S.TrackAlbumLink>
    </S.TrackAlbum >

  <S.TrackTime>
  <S.TrackTimeSvg alt="time" onClick={() => toggleLikeDislike(track.id)}>
  {isLiked ? (<use xlinkHref="/img/icon/sprite.svg#icon-like" fill = "#ad61ff"></use>) : (<use xlinkHref="/img/icon/sprite.svg#icon-like"></use>)}
        
      </S.TrackTimeSvg>
      <S.TrackTimeText >{formatTime(track.duration_in_seconds)}</S.TrackTimeText>
    </S.TrackTime>
  </S.PlaylistTrack>
  </S.PlaylistItem>
)


}
