//draws the sliders and creates the histogram

//margins and dimensions for the slider svg
var slider_margin = {top: 0, right: 30, bottom: 0, left: 30},
    slider_width = 800 - slider_margin.left - slider_margin.right,
    slider_height = 600 - slider_margin.top - slider_margin.bottom;

var hist_height = 250;

//start and end dates for sliders
var startDate = new Date("1985-01-01")
    endDate = new Date("2018-12-31");

//function to parse dates
var parseDate = d3.timeParse("%m/%d/%Y %H:%M");
//function to format for sliders
var formatDate = d3.timeFormat("%b %Y");
//function that was used for ticks
var formatDateIntoYear = d3.timeFormat('%Y')
//scale for sliders
var slider_x = d3.scaleTime()
    .domain([startDate, endDate])
    .range([0, slider_width])
    .clamp(true);
//scale for histogram x pos
var hist_x = d3.scaleLinear()
    .domain([1984, 2018] )
    .range([0, slider_width]);

//scale for histogram y pos
var hist_y = d3.scaleLinear()
    .domain([-1, 50])
    .range([hist_height, 0]);

//scale for calculating length of histogram rects
var bin_y = d3.scaleLinear()
    .domain([0, 50])
    .range([0, hist_height]);

//width of each bin
var bin_width = (hist_x(2019) - hist_x(2018)) * 0.8 ;

//selects the svg for the slider
var slider_svg = d3.select("body").select('.grid-container')
    .select(".slider-container")
    .append("svg")
    .attr("height", slider_height)
    .attr("width",  slider_width + slider_margin.left + slider_margin.right);

//creates the slider
var start_slider = slider_svg.append("g")
    .attr("class", "slider")
    .attr("transform","translate(" + slider_margin.left + "," + 38 + ")");
//creates the slider
var end_slider = slider_svg.append("g")
    .attr("class", "slider")
    .attr("transform","translate(" + slider_margin.left + "," + 110 + ")");

//rect to plot occurences over time
var slider_chart = slider_svg.append('rect')
    .attr('width', slider_width)
    .attr('height', hist_height)
    .attr('stroke', 'black')
    .attr('fill', 'none')
    .attr('stroke-width', 5)
    .attr("transform","translate(" + slider_margin.left + "," + 160 + ")");

//adds the track for the slider
start_slider.append("line")
    .attr("class", "track")
    .attr("x1", slider_x.range()[0])
    .attr("x2", slider_x.range()[1])
    .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
    .attr("class", "track-inset")
    .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
    .attr("class", "track-overlay")
    .call(d3.drag()
        .on("start.interrupt", function() { start_slider.interrupt(); })
        //.on("start drag", function(event) { hue(z.invert(event.x)); }));
        .on("start drag", function(event) { filter_dates_start(slider_x.invert(event.x)); }));

end_slider.append("line")
    .attr("class", "track")
    .attr("x1", slider_x.range()[0])
    .attr("x2", slider_x.range()[1])
    .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
    .attr("class", "track-inset")
    .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
    .attr("class", "track-overlay")
    .call(d3.drag()
        .on("start.interrupt", function() { end_slider.interrupt(); })
        //.on("start drag", function(event) { hue(z.invert(event.x)); }));
        .on("start drag", function(event) { filter_dates_end(slider_x.invert(event.x)); }));


//sets the tick marks for the slider
start_slider.insert("g", ".track-overlay")
    .attr("class", "ticks")
    .attr("transform", "translate(0," + 18 + ")")
    .selectAll("text")
    .data( slider_x.ticks(10))
    .enter()
    .append("text")
    .attr("x", slider_x)
    .attr("y", 10)
    .attr("text-anchor", "middle")
    .text(function(d) { return formatDateIntoYear(d); });

//sets the tick marks for the slider
end_slider.insert("g", ".track-overlay")
    .attr("class", "ticks")
    .attr("transform", "translate(0," + 18 + ")")
    .selectAll("text")
    .data( slider_x.ticks(10))
    .enter()
    .append("text")
    .attr("x", slider_x)
    .attr("y", 10)
    .attr("text-anchor", "middle")
    .text(function(d) { return formatDateIntoYear(d); });

//the label over the circle for the slider
var start_label = start_slider.append("text")  
    .attr("class", "label")
    .attr("text-anchor", "middle")
    .text(formatDate(startDate))
    .attr("transform", "translate(0," + (-25) + ")")

//the circle indicator for the slider
var start_handle = start_slider.insert("circle", ".track-overlay")
    .attr("class", "handle")
    .attr("r", 9);

//the label over the circle for the slider
var end_label = end_slider.append("text")  
    .attr("class", "label")
    .attr("text-anchor", "middle")
    .text(formatDate(endDate))
    .attr("transform", "translate(0," + (-25) + ")")
    .attr('x', slider_x(endDate))

//the circle indicator for the slider
var end_handle = end_slider.insert("circle", ".track-overlay")
    .attr("class", "handle")
    .attr("r", 9)
    .attr('cx', slider_x(endDate));

//add y axis
slider_svg
    .append('g')
    .attr('class', 'hist-y-axis')
    .call(d3.axisRight(hist_y))
    .attr("transform","translate(" + (slider_width + slider_margin.left) + "," + 160 + ")");

//add y label
slider_svg.append('text')
    .attr("transform", "rotate(-90) translate(-275, 5)")
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Recordings / Year");

//add x axis
slider_svg 
    .append('g')
    .call(d3.axisBottom(slider_x))
    .attr("transform","translate(" + slider_margin.left + "," + 410 + ")")

//object to store top of stacked histogram
tops = new Object();


var before_rect;
var after_rect;
var before_line;
var after_line;

//create rects to stack for histogram
//only make RCBP visible initially
d3.csv('grouped.csv').then(data => {
    data.forEach(d => {
        d.year = d.Year;
        d.type = d.Type;
        d.total = +d.Total;
        d.selected = false;
        d.brushed = false;
    });
    //create the bars
    slider_svg.selectAll('bar')
        .data(data)
        .enter().append("rect")
        //only RCBP visible initially
        .attr("visibility", "hidden")
        .attr('class', 'bar')
        //.attr('x', function(d, i) { return i})
        .attr('x', d => {return hist_x(d.year)})
        .attr('y', d => hist_y(d.total))
        .attr('fill', d => color_by_type(d.type))
        .attr('fill-opacity', 0.7)
        .attr('width', bin_width)
        .attr('stroke', "white")
        //make height match bin number
        .attr('height', function(d) {
            return bin_y(d.total)
        })
        .attr("transform","translate(" + 0 + "," + 157 + ")")
        .on('click', function (event, d) {

            d3.selectAll(".bar")
            .attr("fill", function(d) {
                d.selected = false;
                return color_by_type(d.type)
            })
            .attr('fill-opacity', function(d) {
                if (d.brushed) {
                    return 1;
                }
                else {
                    return 0.7;
                }
            })

            d3.select(this).attr("fill",function() {
                d.selected = true;
                return "black"
            })
            .attr('fill-opacity', 1);
            var hist_year = d.year;
            var hist_type = d.type;

            
            d3.selectAll(".point")
            .attr("fill", function(d) { 
                if((formatDateIntoYear(d.date) === hist_year) && d.type === hist_type) {
                    return "black";
                }
                else {
                    return color_by_type(d.type);
                }

            });
                 
        })

    d3.selectAll()

    before_rect = slider_svg.append('rect')
        .attr('class', 'time-rect')
        .attr('width', 0)
        .attr('height', hist_height)
        .attr('fill', 'black')
        .attr('opacity', 0.2)
        .attr('border-right', '2px solid black')
        .attr("transform","translate(" + slider_margin.left + "," + 160 + ")");

    after_rect = slider_svg.append('rect')
        .attr('class', 'time-rect')
        .attr('width', 0)
        .attr('height', hist_height)
        .attr('fill', 'black')
        .attr('x', slider_width)
        .attr('opacity', 0.2)
        .attr('border-left', '2px solid black')
        .attr("transform","translate(" + slider_margin.left + "," + 160 + ")");

    before_line = slider_svg.append('line')
        .attr('stroke', 'black')
        .attr('stroke-width', 3)
        .attr('x1', 0)
        .attr('x2', 0)
        .attr('y1', 0)
        .attr('y2', hist_height)
        .attr("transform","translate(" + slider_margin.left + "," + 160 + ")");

    after_line = slider_svg.append('line')
        .attr('stroke', 'black')
        .attr('stroke-width', 3)
        .attr('x1', slider_width)
        .attr('x2', slider_width)
        .attr('y1', 0)
        .attr('y2', hist_height)
        .attr("transform","translate(" + slider_margin.left + "," + 160 + ")");

    
})

//called when start slider moves
function filter_dates_start(date) {
    //don't move past other slider
    if (slider_x(date) < end_handle.attr('cx') - 1) {
        start_handle.attr("cx", slider_x(date));
        //change label
        start_label
            .attr("x", slider_x(date))
            .text(formatDate(date));
        //filter points and make appropriate points visible
        svg.selectAll(".point")
            .filter(d=> d.checked)
            .attr("visibility", function(d) {
                if ((d.date > date) && d.end) {
                    d.start = true
                    return "visible"
                } else {
                    d.start = false
                    return "hidden"
                }
            })
            /*
            //also need to remove .filter(d => d.checked) line above
            .attr("fill", function(d) {
                if ((d.date > date) && d.end) {
                    d.start = true
                    return color_by_type(d.type)
                } else {
                    d.start = false
                    return "black"
                }
            })*/
        //change the date range over the histogram
        before_rect.attr('width', start_handle.attr('cx'))
        before_line.attr('x1', start_handle.attr('cx'))
        before_line.attr('x2', start_handle.attr('cx'))
    }
} 

//called when end slider moves
function filter_dates_end(date) {
    //don't move past other slider
    if (slider_x(date) > start_handle.attr('cx') + 1) {
        //change slider location
        end_handle.attr("cx", slider_x(date));
        //change label location
        end_label
            .attr("x", slider_x(date))
            .text(formatDate(date));
        //filter and make visible the correct points
        svg.selectAll(".point")
            .filter(d=> d.checked)
            .attr("visibility", function(d) {
                if ((d.date < date) && d.start) {
                    d.end = true
                    return "visible"
                } else {
                    d.end = false
                    return "hidden"
                }
            })
            /*
            //also need to remove .filter(d => d.checked) line above
            .attr("fill", function(d) {
                if ((d.date < date) && d.start) {
                    d.end = true
                    return color_by_type(d.type)
                } else {
                    d.end = false
                    return "black"
                }
            })*/
        //change the date range over the histogram
        after_rect.attr('width', slider_width - end_handle.attr('cx'))
        after_rect.attr('x', end_handle.attr('cx'));
        after_line.attr('x1', end_handle.attr('cx'))
        after_line.attr('x2', end_handle.attr('cx'))
    }
} 


