const users = [];

function userJoin(id, username, room, isAdmin)
{
    const user = {id, username, room, isAdmin};
    users.push(user);
    return user;
}

function getCurrentUser(id)
{
    return users.find(user => user.id === id);
}

function userLeave(id){
    const index = users.findIndex(user => user.id === id);
    if(index !== -1)
    {
        return users.splice(index, 1)[0];
    }
}

function removeUser(username){
    const index = users.findIndex(user => user.username === username);
    if(index !== -1)
    {
        let time = new Date().getTime();
        let user = users.splice(index, 1)[0];
        const data = fs.readFileSync('banned-users.json', 'utf8');
        const bannedUsers = JSON.parse(data);
        bannedUsers.push({username: username, time: time, room: user.room });
        fs.writeFileSync('banned-users.json', JSON.stringify(bannedUsers), { encoding: "utf8"}); 
        return user;
    }
    console.log("here");
}

function getRoomUsers(room)
{
    return users.filter(user => user.room === room);
}

function checkIfUserIsLoggedInRoom(username, room)
{
    for(let i=0;i<users.length;++i)
    {
        if(users[i].username == username && users[i].room == room)
        {
            return true;
        }
    }
    return false;
}

module.exports = {
    removeUser,
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers, 
    checkIfUserIsLoggedInRoom
}