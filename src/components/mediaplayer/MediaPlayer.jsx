import { useState, useRef, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import ProgressBar from "./ProgressBar.jsx";
import * as S from "./style.js"
import { nextTrack, pagePlaylists, pauseTrack, playTrack, prevTrack, repeatTrack, resetState,  shufflePlaylist } from "../../store/actions/creators/index.js";import { useMemo } from "react";
import { useDislikeTrackMutation, useLikeTrackMutation } from "../../services/favoriteTrack.js";
import { useUserContext } from "../../context/user.jsx";
import { useNavigate } from "react-router-dom";
import { PlaylistSelector, isTrackPlayingSelector, pagePlaylistSelector, repeatTrackSelector, shuffledPlaylistSelector, tracksSelectors } from "../../store/selectors/index.js";

export default function MediaPlayer( ){
  const dispatch = useDispatch() 
  const tracklist = useSelector(pagePlaylistSelector)
  const selectedTrack = useSelector(tracksSelectors)
  const isPlaying = useSelector(isTrackPlayingSelector)
  const AudioRef = useRef(null);
  const shuffled = useSelector(shuffledPlaylistSelector)
  const isLoop = useSelector(repeatTrackSelector)
  const [volume, setVolume] = useState(100);
  const [duration, setDuration] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const {user} = useUserContext() 
  const navigate = useNavigate()
  useEffect(() => {
    if (selectedTrack ) {
      AudioRef.current.addEventListener('loadeddata', () => {
      handleStart();
      })
      AudioRef.current.src = selectedTrack .track_file;    
    }
  }, [selectedTrack.track_file]);
  useEffect(() => {
    if (AudioRef) {
      AudioRef.current.volume = volume / 100;
    }
  }, [volume, AudioRef]);
  const onLoadedMetadata = () => {
    setDuration(AudioRef.current.duration);
  };
  const onTimeUpdate = () => {
    setCurrentTime(AudioRef.current.currentTime);
  };
  const handleRepeat = () => {
dispatch(repeatTrack())
  }

  const handleNext = useCallback(() => {
    dispatch(nextTrack())
  }, [dispatch])

const handlePrevious = () => {
    dispatch(prevTrack())
  
}

const handleShuffle =() => {
  dispatch(shufflePlaylist())
}
const handleDurationChange = (e) => {
  setCurrentTime(e.target.value);
  AudioRef.current.currentTime = e.target.value
}

useEffect(() => {
  if (selectedTrack.duration_in_seconds){
    setDuration(AudioRef.current.duration)
}})
  const handleStop = () => {
        AudioRef.current.pause();
        dispatch(pauseTrack())

  };
  const handleStart = () => {
    dispatch(playTrack())
        AudioRef.current.play();
  };

  const togglePlay = isPlaying ? handleStop : handleStart;
  const isUserLike = Boolean(selectedTrack?.stared_user  ?  (selectedTrack?.stared_user?.find((selectedTrack) => selectedTrack.id === user.id)) : true)
  const [isLiked, setIsLiked] = useState(isUserLike)
  const [likeTrack, ] = useLikeTrackMutation()
  const [dislikeTrack, ] = useDislikeTrackMutation()
  useEffect(() => {
    setIsLiked(isUserLike)
  }, [isUserLike, selectedTrack])

  const handleLike = async (id) => {
    setIsLiked(true)
    try {
      await likeTrack({ id }).unwrap()
      const originalPlaylist = tracklist

      const item = originalPlaylist?.find((elem) => elem.id === id)
      if (!item) return
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
    if (!item) return
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
   
  
  const toggleLikeDislike = (id) => isLiked? handleDislike(id) : handleLike(id)

    return(<> 
 <S.BarStyle>
        {selectedTrack? (<audio   style={{ display: 'none' }} ref={AudioRef}  loop = {isLoop} onEnded={handleNext} controls src={selectedTrack.track_file}  onLoadedMetadata ={onLoadedMetadata} onTimeUpdate  ={onTimeUpdate } ></audio>) : (null)}        
       <S.BarContent>
         <ProgressBar  handleDurationChange ={handleDurationChange }  duration = {duration} currentTime = {currentTime}  ></ProgressBar>
         <S.BarPlayerBlock >
           <S.BarPlayer>
             <S.PlayerControls>
               <S.PlayerBtnPrev>
                 <S.PlayerBtnPrevSvg  alt="prev" onClick={handlePrevious }>
                   <use xlinkHref="/img/icon/sprite.svg#icon-prev"></use>
                 </S.PlayerBtnPrevSvg>
               </S.PlayerBtnPrev>
               <S.PlayerBtnPlay className="_btn" onClick={togglePlay}>
                 <S.PlayerBtnPlaySvg alt="play"  >
                   {isPlaying ? (<use xlinkHref="/img/icon/sprite.svg#icon-pause"></use>) : (<use xlinkHref="/img/icon/sprite.svg#icon-play"></use>)}
                   
                 </S.PlayerBtnPlaySvg>
               </S.PlayerBtnPlay>
               <S.PlayerBtnNext>
                 <S.PlayerBtnNextSvg alt="next" onClick={handleNext}> 
                   <use xlinkHref="/img/icon/sprite.svg#icon-next"></use>
                 </S.PlayerBtnNextSvg>
               </S.PlayerBtnNext>
               {isLoop ? ( <S.PlayerBtnRepeat className="_btn-icon" onClick={handleRepeat}>
                 <S.PlayerBtnRepeatSvgActive alt="repeat">
                   <use xlinkHref="/img/icon/sprite.svg#icon-repeat"></use>
                 </S.PlayerBtnRepeatSvgActive>
               </S.PlayerBtnRepeat>) : (  <S.PlayerBtnRepeat className="_btn-icon" onClick={handleRepeat}>
                 <S.PlayerBtnRepeatSvg alt="repeat">
                   <use xlinkHref="/img/icon/sprite.svg#icon-repeat"></use>
                 </S.PlayerBtnRepeatSvg>
               </S.PlayerBtnRepeat>)}
               <S.PlayerBtnShuffle className="_btn-icon" onClick={handleShuffle }>
                {shuffled ? (<S.PlayerBtnShuffleSvgActive alt="shuffle">
                  <use xlinkHref="/img/icon/sprite.svg#icon-shuffle"></use>
                 </S.PlayerBtnShuffleSvgActive>) : (<S.PlayerBtnShuffleSvg alt="shuffle">
                  <use xlinkHref="/img/icon/sprite.svg#icon-shuffle"></use>
                 </S.PlayerBtnShuffleSvg>)}
               </S.PlayerBtnShuffle>
             </S.PlayerControls>
             <S.PlayerTrackPlay >
    <S.TrackPlayContain >
                    <S.TrackPlayImage>
                      <S.TrackPlaySvg alt="music">
                        <use xlinkHref="/img/icon/sprite.svg#icon-note"></use>
                      </S.TrackPlaySvg>
                    </S.TrackPlayImage>
                    <S.TrackPlayAuthor>
                      <S.TrackPlayAuthorLink href="http://">{selectedTrack? (selectedTrack.name) : (null)}</S.TrackPlayAuthorLink>
                    </S.TrackPlayAuthor>
                    <S.TrackPlayAlbum>
                      <S.TrackPlayAlbumLink href="http://">{selectedTrack ? (selectedTrack.author) : (null)}</S.TrackPlayAlbumLink>
                    </S.TrackPlayAlbum>
                  </S.TrackPlayContain>
                  
                  <S.TrackPlayLikeDis >  
                             <S.TrackPlayLike className="_btn-icon"onClick={() => toggleLikeDislike(selectedTrack.id)}>  
                          <S.TrackPlayLikeSvg  alt="like" >    
{isLiked  ? (<use xlinkHref="/img/icon/sprite.svg#icon-like"fill = "#ad61ff"></use>                     
                     ) : (                 


                       <use xlinkHref="/img/icon/sprite.svg#icon-like"></use>)

                      }
    </S.TrackPlayLikeSvg>

</S.TrackPlayLike>
                  </S.TrackPlayLikeDis>  






                         </S.PlayerTrackPlay>
           </S.BarPlayer>
           <S.BarVolumeBlock>
             <S.VolumeContent>
               <S.VolumeImage>
                 <S.VolumeSvg alt="volume">
                   <use xlinkHref="/img/icon/sprite.svg#icon-volume"></use>
                 </S.VolumeSvg>
               </S.VolumeImage>
               <S.VolumeProgress className="_btn">
                 <S.VolumeProgressLine
                   className=" _btn"
                   type="range"
                   name="range"
                   min={0}
                   max={100}
                   value={volume}
                   onChange={(e) => setVolume(e.target.value)}/>
               </S.VolumeProgress>
             </S.VolumeContent>
           </S.BarVolumeBlock>
         </S.BarPlayerBlock>
       </S.BarContent>
       </S.BarStyle> 
       
       </> )
    }