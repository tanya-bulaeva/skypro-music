import { SET_CURRENT_TRACK, NEXT_TRACK,  PREVIOUS_TRACK, CURRENT_PLAYLIST, PLAY_TRACK, PAUSE_TRACK, SHUFFLE_PLAYLIST, REPEAT_TRACK, PAGE_PLAYLIST, RESET_STATE} from "../actions/types/index";

// 1.В переменной initialState хранится логика.
const initialState = {
playing: false,
playlist: [],
track: null,
shuffledPlaylist: false,
repeat: false,
pagePlaylist : [],

};

// 2.это чистая функция, принимающая два аргумента: state и пришедший action. 
//Если нет state, мы назначаем default в виде переменной initialState

export default function trackReducer(state = initialState, action) {
  switch (action.type) {
    // 3.Внутри редьюсера мы делаем switch-case, чтобы отловить пришедший нам action, понять, 
    //что он известен системе, и написать обработку для этого action, то есть что нам сделать со store.
        case SET_CURRENT_TRACK: {
//4. Redux должен понять, что store изменился, и тогда Redux оповещает подписчиков о том, что состояние изменилось.
 //А далее идет механизм предоставления подписчикам нового состояния.
 return {
        ...state,
        playing: true,
        track: action.payload,
      };
    }

    case CURRENT_PLAYLIST: {
      return {
        ...state,
        playlist: action.payload
      }
    }

    case PLAY_TRACK : {
     
     return {
      ...state,
      playing: true
     }

    }
    case PAUSE_TRACK : {
     
      return {
       ...state,
       playing: false
      }
 
     }
    case NEXT_TRACK: {

      return {
        ...state ,
        track: action.payload,
      };
    }
    case PREVIOUS_TRACK: {

      return {
        ...state,
        track: action.payload,
      };
    }
    case SHUFFLE_PLAYLIST: {
      return {
        ...state,
        shuffledPlaylist: !state.shuffledPlaylist,
      };
    }
    case REPEAT_TRACK: {
      return {
        ...state,
        repeat: !state.repeat,
      };
    }

    case PAGE_PLAYLIST: {
      return {
        ...state,
        pagePlaylist: action.payload,
      };
    }

    case RESET_STATE: {
      return initialState;
      
     }
      default:
        return state;
  }
}