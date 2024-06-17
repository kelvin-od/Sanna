export const postActions = {
  SUBMIT_POST: "SUBMIT_POST",
  HANDLE_ERROR: "HANDLE_ERROR",
  ADD_LIKE: "ADD_LIKE",
  ADD_COMMENT: "ADD_COMMENT",
  EDIT_COMMENT: "EDIT_COMMENT",
  DELETE_COMMENT: "DELETE_COMMENT",
};

export const postsStates = {
  error: false,
  posts: [],
  likes: [],
  comments: [],
};

export const PostsReducer = (state, action) => {
  switch (action.type) {
      case postActions.SUBMIT_POST:
          return {
              ...state,
              error: false,
              posts: action.posts,
          };
      case postActions.ADD_LIKE:
          return {
              ...state,
              error: false,
              likes: action.likes,
          };
      case postActions.ADD_COMMENT:
          return {
              ...state,
              error: false,
              comments: action.comments,
          };
      case postActions.EDIT_COMMENT:
          return {
              ...state,
              error: false,
              comments: state.comments.map(comment =>
                  comment.id === action.id ? { ...comment, comment: action.comment } : comment
              ),
          };
      case postActions.DELETE_COMMENT:
          return {
              ...state,
              error: false,
              comments: state.comments.filter(comment => comment.id !== action.id),
          };
      case postActions.HANDLE_ERROR:
          return {
              ...state,
              error: true,
              posts: [],
          };
      default:
          return state;
  }
};
