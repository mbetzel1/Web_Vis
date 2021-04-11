//get data, update svg with circles, draw border and axes
//also handles click, mouseover, mouseout functionality of data
function draw_chart() {
    var formatDateIntoYear = d3.timeFormat('%Y')
    //draw map
    svg.append("image")
        .attr("xlink:href", "./white_map.bmp")
        .attr("width", width)
        .attr("height", height)
        .attr("class", "map");
      
    //add the X axis
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .style("stroke-width", 4)
        .style("font-size", "14px")

    // Add the Y Axis
    svg.append("g")
        .call(d3.axisLeft(y))
        .style("stroke-width", 4)
        .style("font-size", "14px")
        .style('font', 'Times New Roman');

    //add the border to the map
    svg.append("rect")
        .attr("x", 0) 
        .attr("y", 0)
        .attr("height", height)
        .attr("width", width)
        .style("fill", "none")
        .style("stroke-width", 4)
        .style("stroke", "black")
        .attr("class", "image-border");
    
    //create a list of checked choices
    d3.selectAll(".type-checkbox").each(function(d){
        cb = d3.select(this);
        if(cb.property("checked")){
            selected_types.push(cb.property("value"));
        }
        else if(!cb.property("checked")) {
            selected_types = selected_types.filter(item => item !== cb.property("value"))
        }
    });

    //create tooltip
    var tooltip = d3.select("body")
        .append("div")
        .style("position", "absolute")
        .attr("class", "tooltip")
        .attr("id", "tooltip")

    var selected_audio_circle_1 = svg.append('circle')
        .attr('class', 'selected-audio-circle')
        .attr('r', 10)
        .attr('visibility', 'hidden')
        
    var selected_audio_circle_2 = svg.append('circle')
        .attr('class', 'selected-audio-circle')
        .attr('r', 15)
        .attr('visibility', 'hidden')

    //add text areas for tooltip
    tooltip.append("div")
        .attr('class', 'type');
    tooltip.append('div')
        .attr('class', 'date')
    tooltip.append('div')
        .attr('class', 'coords')

    //add rect for gridlines from point
    var lines = svg.append("rect")
        .style("opacity", 0)
        .attr("class", "grid-lines")
        .attr("z-index", 2);

    //load data
    d3.csv("Cleaned_All_Birds_V2.csv").then(data => {
        data.forEach(d => {
            d.textdate = d.Datetime;
            d.type = d.English_name;
            d.x = +d.X;
            d.y = +d.Y;
            d.id = +d.ID;
            d.date = parseDate(d.Datetime);
            d.checked = false
            d.start = true
            d.end = true
        });
        
    //create circles for each sample
    svg.selectAll("dot")
        .data(data)
        .enter().append("circle")
        //.filter(d => {return choices.includes(d.type)})
        .attr("visibility", "hidden")
        .attr('class', 'point')
        //circle size
        .attr("r", 7.5)
        //x coordinate
        .attr("cx", d => {return x(d.x)})
        //y coordinate
        .attr("cy", d => {return y(d.y)})
        //color set by type
        .attr("fill", d => {return color_by_type(d.type)})
        .attr("stroke", d => {return color_by_type(d.type)})
        .attr("stroke-width", 1)
        .attr("fill-opacity", 0.65)
        .attr("z-index", 0)
        //on mouseover function
        .on('mouseover', function (event, d) {
            //increase stroke width of circle
            d3.select(this).transition()
                .duration('300')
                .attr("stroke-width", 5)
            //make grid lines visible and set position
            svg.append("rect")
                .attr('class', 'grid-lines')
                .attr("x", x(0))
                .attr("y", y(d.y))
                .attr("width", x(d.x))
                .attr("height",  y(0) - y(d.y))
            //show tooltip
            tooltip
                .style("opacity", 0.8)
                .style("left", (d3.pointer(event)[0] + 100) + "px")
                .style("top", (d3.pointer(event)[1] + 100) + "px")
                .select('.type')
                .html('<b>Type: ' + d.type +'</b>')
                tooltip.select('.date')
                .html('<b>Date: ' + d.textdate +'</b>')
                tooltip.select('.coords')
                .html('<b>Coordinates: X: ' + d.x + ', Y: ' + d.y + '</b>')

        })
        //move off of circle
        .on('mouseout', function () {
            d3.select(this).transition()
                .duration('200')
                .attr("stroke-width", 0);
            //makes div disappear
            svg.selectAll('rect.grid-lines').remove();
            tooltip
                .style("opacity", 0)
                .attr('x', 50000);
            
        })
        //on click move shape over object and populate wavesurfer
        .on('click', function(event, d) {
            selected_audio_circle_1
                .attr('visibility', 'visible')
                .attr('cx', x(d.x))
                .attr('cy', y(d.y))
            selected_audio_circle_2
                .attr('visibility', 'visible')
                .attr('cx', x(d.x))
                .attr('cy', y(d.y))

            //brush the histogram when clicked
            var click_year = formatDateIntoYear(d.date);
            var click_type = d.type;

            d3.selectAll('.bar')
                //set opacity of selected bars to 1 others to 0.7
                .attr('fill-opacity', function(d) {
                    if ((d.year === click_year) && (d.type === click_type)) {
                        d.brushed = true;
                        return 1;
                    }
                    else if(!d.selected) {
                        return 0.7;
                    } 
                    else {
                        return 1;
                    }
                });
                

            
            var rec_id = d.id;
            var audio_file = string_to_WAV((d.type));
            console.log(audio_file)
            //populate wavesurfer waveform and spectrogram
            wavesurfer.params.waveColor = get_wave_color(color_by_type(d.type));;
            wavesurfer.params.progressColor = color_by_type(d.type);
            wavesurfer.load(audio_file);
            d3.select('#audio-title')
                .text(d.type);

        });
        //draw kasios dumpsite
        svg.append("polygon")
        .attr("fill", "none")
        .attr("stroke-width", 5)
        .attr("stroke", "black")
        .attr('points', "548, 177 538, 197 558, 197" );

        //draw label for dumpsite
        svg.append("text")
            .attr("x", x(148))
            .attr("y", y(155))
            .text("Dumpsite")
            .attr("text-anchor", "middle")
            .attr("pointer-events", "none");
        
    });
    draw_kasios();
}

//converts data to a file name for loading waveform
function string_to_WAV(title) {
    title = title.toLowerCase()
        .replaceAll('-', ' ')
        .split(' ')
        .map(function(word) {
            return word.replace(word[0], word[0].toUpperCase());
        })
    title = title.join(' ').replaceAll(' ', '-')
    return ('All_Birds_WAV/' + title + '.wav').replaceAll(/%20/g, '-')
}

//decreases opacity of color for waveform image
function get_wave_color(input_color) {
    var c = d3.color(input_color)
    c.opacity = 0.5;
    return c + '';
}