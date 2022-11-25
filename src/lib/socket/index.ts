import { Socket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import User, { UserActions } from '../../models/user';

export default function connectionIo(socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) {
  socket.on('join-room', async (roomId, userId, peerId) => {
    await User.createOrGetUser({ action: UserActions.ID, payload: userId });
    socket.join(roomId);
    // console.log(peerId);
    socket.broadcast.to(roomId).emit('user-connected', peerId);
  });
}
