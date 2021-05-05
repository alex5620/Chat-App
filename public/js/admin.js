function openModal()
{
    var modal = document.getElementById("modal");
    socket.emit('users', room);
    modal.style.display = "block";
}

function closeModal()
{
    var modal = document.getElementById("modal");
    modal.style.display = "none";
}
