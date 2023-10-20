import * as S from "../main/style";
import { useState, useEffect, useRef } from 'react';
import NavMenu from "../../components/navMenu/NavMenu";
import Search from "../../components/search/Search";
import Filter from "../../components/filter/Filter";
import UserAccount from "../../components/userAccount/UserAccount";
import Collections from "../../components/collections/Collections";
import MediaPlayer from "../../components/mediaplayer/MediaPlayer";
import Playlist from "../../components/playlist/Playlist";
import { useGetFavTracksQuery } from "../../services/favoriteTrack";
import { useDispatch, useSelector } from "react-redux";
import { PlaylistSelector, isTrackPlayingSelector, pagePlaylistSelector, tracksSelectors } from "../../store/selectors";
import { pagePlaylist } from "../../store/actions/creators";
import { getTrack } from "../../api"; 
export const Favorites = ({  currentTrack,   tracksError,  setCurrentTrack, user, Audioref}) => {
//const { data, error, isLoading } =  useGetFavTracksQuery()
const dispatch = useDispatch();
const [playlistError, setPlaylistError ] = useState();
const  selectedTrack = useSelector(tracksSelectors);
const [loading, setLoading] = useState(false);
const tracks = useSelector(PlaylistSelector)
const playlist = useSelector(pagePlaylistSelector)

useEffect(() => {
  // Заводим таймер
  const timerId = setInterval(() => setLoading(!loading), 5000);		
  // Данная функция вызывается при удалении компонента из DOM
  return () => {
      // Наводим порядок после удаления компонента
      clearInterval(timerId);
  };
}, []);


useEffect(() => {
  setLoading(true)
  getTrack()
    .then((tracks) => {
      dispatch(pagePlaylist(tracks))
   //   console.log(tracks)
    })
    .catch(() => {
      setPlaylistError("Не удалось загрузить плейлист, попробуйте позже")
    })
    .finally(() => setLoading(false))
}, [])


    return (        <>
        <S.GlobalStyle />
    <S.WrapperStyle>
      <S.ContainerStyle>
        <S.MainStyle>
        <NavMenu />
          <S.MainCenterblock>
        <Search />
            <S.CenterclockH2>Мой плейлист</S.CenterclockH2>
            {playlistError? (<p>Не удалось загрузить плейлист, попробуйте позже</p>) : (<Playlist loading = {loading} tracks={tracks} tracksError = {tracksError}  currentTrack = {currentTrack }  setCurrentTrack = {setCurrentTrack } ref = {Audioref} />      )}
                    </S.MainCenterblock>
          <S.MainSidebar>
        <UserAccount />
          </S.MainSidebar>
              {selectedTrack  ? (<MediaPlayer loading = {loading} tracks={tracks} currentTrack = {currentTrack} setCurrentTrack = {setCurrentTrack} />) : null} 
                  </S.MainStyle>

        <footer className="footer"></footer>
      </S.ContainerStyle>
    </S.WrapperStyle>
    </>
    );

        };