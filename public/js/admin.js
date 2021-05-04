function openModal()
{
    var modal = document.getElementById("modal");
    modal.style.display = "block";
}

window.onclick = function(event) {
    var modal = document.getElementById("modal");
    if (event.target == modal) {
        closeModal();
    }
}

function closeModal()
{
    var modal = document.getElementById("modal");
    modal.style.display = "none";
}
