//draws the data related to kasios
function draw_kasios() {

    //draw key for symboll
    svg.append("line")
        .attr('x1', x(2))
        .attr('x2', x(6))
        .attr('y1', y(2))
        .attr('y2', y(6))
        .attr('stroke-width', 3)
        .attr('stroke', 'black')
    svg.append("line")
        .attr('x1', x(6))
        .attr('x2', x(2))
        .attr('y1', y(2))
        .attr('y2', y(6))
        .attr('stroke-width', 3)
        .attr('stroke', 'black')

    //draw label for key
    svg.append("text")
        .attr("x", x(7))
        .attr("y", y(2.3))
        .text("= Kasios Recording")
        .attr("pointer-events", "none");

    //draw kasios data
    d3.csv("Kasios.csv").then(kasios => {
        kasios.forEach(d => {
            d.x = +d.X;
            d.y = +d.Y;
            d.id = d.ID;
        });
    
    //create group for cross and invisible rect
    kasios_group = svg.selectAll(".kasios-group")
        .data(kasios).enter()
        .append('g')
        .attr('class', 'kasios-group');

    //attach half of cross to group
    kasios_group
        .append("line")
        .attr("class", "kasios-line")
        .attr("x1", d => {return x(d.x - 2)})
        .attr("y1", d => {return y(d.y - 2)})
        .attr("x2", d => {return x(d.x + 2)})
        .attr("y2", d => {return y(d.y + 2)})
        
    //attach other half of cross to group
    kasios_group
        .append("line")
        .attr("class", "kasios-line")
        .attr("x1", d => {return x(d.x + 2)})
        .attr("y1", d => {return y(d.y - 2)})
        .attr("x2", d => {return x(d.x - 2)})
        .attr("y2", d => {return y(d.y + 2)});
    
    svg.append('rect')
        .attr('class', 'selected-audio-rect')
        .attr('height', x(6))
        .attr('width', x(6))
        .attr('fill', 'none')
        .attr('visibility', 'hidden')

    //attach rect to group and make it visible on hover. On click make it permanent until another X is clicked
    kasios_group
        .append('rect')
        .attr('class', 'kasios-rect')
        .attr('x', d => x(d.x -3) )
        .attr('y', d => y(d.y + 3))
        .attr('height', x(6))
        .attr('width', x(6))
        .attr('fill', 'red')
        .attr('fill-opacity', 0.01)
        .attr('opacity', 0)
        //on click move shape and populate kasios wavesurfer
        .on('click', function(event, d) {
            d3.select('.selected-audio-rect')
                .attr('x', x(d.x - 3))
                .attr('y', y(d.y + 3))
                .attr('visibility', 'visible')
            var id = d.id;
            var kasios_file = 'Kasios_WAV/' + id + '.wav';
            kasios_wavesurfer.load(kasios_file)
            d3.select('#kasios-audio-title')
                .text('Kasios Recording ' + id);
            kasios_wavesurfer.on('ready', function() {
                d3.select('spectrogram')
                    .attr('width', 'none')
            })
        })
        //make rect visible on mousever
        .on('mouseover', function() {
            d3.select(this).transition()
                .duration('300')
                .attr('opacity', 1)
                .attr('stroke-width', 5);
        })
        .on('mouseout', function() {
            d3.select(this).transition()
                .duration('300')
                .attr('opacity', 0.01)
                .attr('stroke-width', 3);;
        })
    });
    //give behavior for kasios checkbox
    kasios_cb = d3.select('.kasiosCheckbox')
        .property('checked', true)
        .on('change', kasios_update)
    
}

//if box is checked make groups visible, otherwise make them hidden
function kasios_update() {
    if(kasios_cb.property('checked')) {
        d3.selectAll('.kasios-group')
        .attr('visibility', 'visible')
    } 
    else {
        d3.selectAll('.kasios-group')
        .attr('visibility', 'hidden')
    }
}