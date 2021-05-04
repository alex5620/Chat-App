colorsArray = [
    {value1: '#667aff', value2: '#7386ff'},
    {value1: '#f03131', value2: '#f03131ea'},
    {value1: '#28bd03', value2: '#28bd03da'}
];

function changeStyle(cond)
{
    let colorIndex = localStorage.getItem('colorIndex');
    if(cond)
    {
        ++colorIndex;
        colorIndex = colorIndex % colorsArray.length;
        localStorage.setItem('colorIndex', colorIndex);
    }
    let root = document.documentElement;
    root.style.setProperty('--darker-color', colorsArray[colorIndex].value1);
    root.style.setProperty('--lighter-color', colorsArray[colorIndex].value2);
};

changeStyle(false);