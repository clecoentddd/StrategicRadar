import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { useRouter } from 'next/router'; // For navigation
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const RadarChart = ({ items, radius = 200 }) => {
  const svgRef = useRef();
  const router = useRouter(); // Next.js router for navigation

  useEffect(() => {
    console.log("Rendering RadarChart...");
    console.log("Items: ", items);

    // Clear previous SVG content
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', radius * 2 + 50)
      .attr('height', radius * 2 + 50)
      .append('g')
      .attr('transform', `translate(${radius + 25}, ${radius + 25})`);

    // Draw quadrants
    for (let i = 0; i < 4; i++) {
      svg.append("path")
        .attr("d", d3.arc()
          .innerRadius(0)
          .outerRadius(radius)
          .startAngle((Math.PI / 2) * i)
          .endAngle((Math.PI / 2) * (i + 1))
        )
        .attr("fill", i % 2 === 0 ? "#f0f0f0" : "#e0e0e0")
        .attr("stroke", "#ccc");
    }

    // Draw concentric circles for distances
    [0.25, 0.5, 0.75, 1].forEach(d => {
      svg.append("circle")
        .attr("r", radius * d)
        .attr("fill", "none")
        .attr("stroke", "#ddd");
    });

    // Group items by category and distance
    const groupedItems = items.reduce((acc, item) => {
      const key = `${item.category}-${item.distance}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});

    console.log("Grouped Items: ", groupedItems);

    // Map distance to radius
    const distanceToRadius = {
      dist1: radius,
      dist2: radius * 0.75,
      dist3: radius * 0.5,
      dist4: radius * 0.25,
    };

    // Position items in each category quadrant based on distance
    Object.entries(groupedItems).forEach(([key, items]) => {
      const [category, distance] = key.split('-');
      const angleOffset = (Math.PI / 2) * (parseInt(category.replace('cat', '')) - 1);
      const distRadius = distanceToRadius[distance] || radius;

      console.log(`Category: ${category}, Distance: ${distance}, Radius: ${distRadius}`);

      // Calculate equal-angle spacing for items at the same distance
      const angleStep = (Math.PI / 2) / (items.length + 1);
      items.forEach((item, index) => {
        const angle = angleOffset + angleStep * (index + 1);
        const x = distRadius * Math.cos(angle);
        const y = distRadius * Math.sin(angle);

        console.log(`Item: ${item.name}, Position: (${x}, ${y}), Impact: ${item.impact}, Cost: ${item.cost}`);

        const color = getColorByImpact(item.impact);
        const size = getSizeByCost(item.cost);

        // Append group for each item
        const itemGroup = svg.append('g')
          .on('mouseover', async function () {
            console.log(`Mouse over: ${item.name}, zoom_in id: ${item.zoom_in}`);

            d3.select(this).select('circle').attr('stroke', 'black').attr('stroke-width', 3);

            // Fetch the radar name based on zoom_in
            let tooltipText = `<strong>${item.name}</strong><br/>Impact: ${item.impact}<br/>Cost: ${item.cost}`;

            if (item.zoom_in) {
              const radar = await fetchRadarName(item.zoom_in);
              tooltipText += `<br/>Zoom in into radar: <a href='/radar/${item.zoom_in}' target='_blank' style='color: blue;'>${radar}</a>`;
            } else {
              tooltipText += `<br/>Zoom In Not Selected`;
            }

            // Display tooltip with item data
            const tooltip = d3.select('.tooltip');
            tooltip.style('visibility', 'visible')
              .html(tooltipText)
              .style('pointer-events', 'auto'); // Ensure the link is clickable
          })
          .on('mouseout', function () {
            console.log(`Mouse out: ${item.name}`);
            d3.select(this).select('circle').attr('stroke', 'white').attr('stroke-width', 2);

            // Hide tooltip
            d3.select('.tooltip').style('visibility', 'hidden');
          })
          .on('click', () => {
            console.log("Navigating to radar item with id:", item.id); // Log the id
            if (item.id) {
              setTimeout(() => {
                console.log("After navigation: id", item.id);
            }, 10);
              console.log("Before navigation: id", item.id); // Log before navigation
              setTimeout(() => {
                router.push(`/radar/${item.id}`);
                console.log("After navigation: id", item.id); // This might not be reached as expected
              }, 0); // Delay to allow logs before navigation
            } else {
              console.error("Item ID is missing");
            }
          }); // Single-click event to navigate

        // Draw item circle
        itemGroup.append('circle')
          .attr('cx', x)
          .attr('cy', y)
          .attr('r', size)
          .attr('fill', color)
          .attr('stroke', 'white')
          .attr('stroke-width', 2);

        // Draw item name
        itemGroup.append('text')
          .attr('x', x)
          .attr('y', y - size - 5)
          .attr('text-anchor', 'middle')
          .attr('font-size', '10px')
          .attr('fill', '#333')
          .text(item.name);
      });
    });
  }, [items, radius, router]);

  // Function to fetch radar name by zoom_in
  const fetchRadarName = async (zoom_in) => {
    console.log(`Fetching radar name for zoom_in: ${zoom_in}`);
    try {
      const { data, error } = await supabase
        .from('radars')
        .select('name')
        .eq('id', zoom_in)
        .single();

      if (error) {
        console.error("Error fetching radar name:", error.message);
        return 'Error fetching radar';
      }

      console.log("Radar name found: ", data?.name);
      return data?.name || 'No name available';
    } catch (error) {
      console.error("Unexpected error:", error);
      return 'Error fetching radar';
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <svg ref={svgRef}></svg>
      <div className="tooltip" style={{
        position: 'absolute',
        top: 0,
        left: 0,
        background: 'white',
        border: '1px solid #ccc',
        padding: '5px',
        fontSize: '12px',
        pointerEvents: 'none', // Ensure the tooltip is not blocking interaction
        visibility: 'hidden',
        zIndex: 10, // Ensure tooltip appears above other elements
      }}></div>
    </div>
  );
};

// Helper functions for impact and cost
const getColorByImpact = (impact) => {
  console.log(`Getting color for impact: ${impact}`);
  switch (impact) {
    case 'low':
      return 'green';
    case 'medium':
      return 'orange';
    case 'high':
      return 'red';
    default:
      return 'steelblue';
  }
};

const getSizeByCost = (cost) => {
  console.log(`Getting size for cost: ${cost}`);
  switch (cost) {
    case 'low':
      return 7;
    case 'medium':
      return 10;
    case 'high':
      return 15;
    default:
      return 10;
  }
};

export default RadarChart;
