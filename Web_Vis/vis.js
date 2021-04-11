/* 
/main file, handles updates to checkboxes and calls other functions

references:
slider: https://bl.ocks.org/linoba/ecfc96ae52d5f8b8a7435ee5ab49635a
axis labels: https://bl.ocks.org/d3noob/f46a355d35077a7dc12f9a97aeb6bc5d/wavesurfer: https://wavesurfer-js.org/example/spectrogram/index.html
 */

//set margin and size variables
var margin = {top: 30, right: 30, bottom: 30, left: 30},
    width = 800 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom;

//list for checkboxes
var selected_types = [];

//create my scales and date formatters/parsers
var x = d3.scaleLinear().domain([0, 200]).range([0, width]);
var y = d3.scaleLinear().domain([0, 200]).range([height, 0]);

//select body
var body = d3.select("body");

//create svg to hold scatterplot
var svg = body.select('.grid-container')
    .select('.svg-container')
    .append("svg")
    //set its size
    .attr("height", height + margin.top + margin.bottom)
    //set its max width
    .attr("width", width + margin.left + margin.right)
    //append a group element
    .append("g")
    //move it to top left
    .attr("transform","translate(" + margin.left + "," + margin.top + ")");

//set checkbox update on change
d3.selectAll('.type-checkbox')
    .on("change", function() {
        update();
        return;
    });
//select all button function
d3.select('.select-button')
    .on("click", selectCBs);
//deselect all button function
d3.select('.deselect-button')
    .on("click", deselectCBs);

//draw everything once page is loaded
draw_chart();

//default to rcbp on
/* d3.select('#rcbp-cb')
        .property('checked', true); */

//get max number for top of stacked bars, gets it in pixels
function max_top(tops) {
    var max = 0;
    for (i = 1983; i < 2019; i++) {
        if (tops[i] > max) {
            max = tops[i];
        }
    }
    return max;
}

//rescales histogram, redraws bars, and redraws scale
function rescale() {
    //reset value for tops
    var tops = new Object();
    for (i = 1983; i < 2019; i++) {
        tops[i] = 0;
    }
    //make non-checked hist rects hidden
    slider_svg.selectAll('.bar')
        .attr("visibility", function(d) {
        if (selected_types.includes(d.type)) {
            tops[d.year] += d.total + 2;
            return "visible"; 
        } else {
            return "hidden";
        }
    })

    //get max value for a year
    var max = max_top(tops);
    hist_y.domain([0, max]).range([hist_height, 0]);

    bin_y.domain([0, max]).range([0, hist_height]);

    slider_svg
        .select('.hist-y-axis')
        .call(d3.axisRight(hist_y))
        .attr("transform","translate(" + (slider_width + slider_margin.left) + "," + 160 + ")");
    
    //reset value for tops
    var tops = new Object();
    for (i = 1983; i < 2019; i++) {
        tops[i] = 0;
    }
    slider_svg.selectAll('.bar')
        .attr('y', function(d) {
            if (selected_types.includes(d.type)) {
                tops[d.year] += d.total;
                return hist_y(tops[d.year]);
            }
        })
        //make height match bin number
        .attr('height', function(d) {

            return bin_y(d.total)
    })

    
}
//function to update chart when checkbox is pressed
function update() {
    //see which checkboxes are pressed and save to list
    d3.selectAll(".type-checkbox").each(function(d){
        cb = d3.select(this);
        //if box is checked for type add to list of checked types
        if(cb.property("checked")){
          selected_types.push(cb.property("value"));
        } 
        //remove from list of checked types if box is not checked
        else {
            selected_types = selected_types.filter(item => item !== cb.property("value"))
        }
      });
    //turns non-checked circles hidden
    //also changes a variable to check why box is set to hidden
    //d.checked variable is important for slider functionality
    svg.selectAll(".point")
        .attr("visibility", function(d) {
            if (selected_types.includes(d.type)) {
                d.checked = true;
                if (d.date > slider_x.invert(start_handle.attr('cx')))
                {
                    return "visible";
                } else {
                    return "hidden";
                }
            } else {
                d.checked = false;
                return "hidden";
            }
        })
    
    //repaint histogram with no scale
    rescale();

    //draw kasios dumpsite
    svg.append("polygon")
        .attr("fill", "none")
        .attr("stroke-width", 5)
        .attr("stroke", "black")
        .attr('points', "548, 177 538, 197 558, 197" );

}

//select all button functionality
function selectCBs() {
    d3.selectAll('.type-checkbox')
        .property('checked', true);
    update();
    d3.select('.kasiosCheckbox')
        .property('checked', true)
    kasios_update();
}

//deselect all button functionality
function deselectCBs() {
    d3.selectAll('.type-checkbox')
        .property('checked', false)
    update();
    d3.select('.kasiosCheckbox')
        .property('checked', false)
    kasios_update();
}

update();
