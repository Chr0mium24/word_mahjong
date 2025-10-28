module.exports = (io, socket) => {
  const createRoom = (payload) => {
    // TODO: Implement room creation logic
    console.log('createRoom event received with payload:', payload);
  };

  const joinRoom = (payload) => {
    // TODO: Implement room joining logic
    console.log('joinRoom event received with payload:', payload);
  };

  socket.on('createRoom', createRoom);
  socket.on('joinRoom', joinRoom);
};
