// MSW handlers index
import { authHandlers } from './auth';
import { policiesHandlers } from './policies';
import { bookmarksHandlers } from './bookmarks';
import { postsHandlers } from './posts';
import { usersHandlers } from './users';

export const handlers = [
  ...authHandlers,
  ...policiesHandlers,
  ...bookmarksHandlers,
  ...postsHandlers,
  ...usersHandlers,
];
