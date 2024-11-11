// components/RadarChart.js

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const RadarChart = ({ items, radius = 200 }) => {
  const svgRef = useRef();

  useEffect(() => {
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

      // Calculate equal-angle spacing for items at same distance
      const angleStep = (Math.PI / 2) / (items.length + 1);
      items.forEach((item, index) => {
        const angle = angleOffset + angleStep * (index + 1);
        const x = distRadius * Math.cos(angle);
        const y = distRadius * Math.sin(angle);

        // Draw item circle
        svg.append('circle')
          .attr('cx', x)
          .attr('cy', y)
          .attr('r', 10)
          .attr('fill', 'steelblue')
          .attr('stroke', 'white')
          .attr('stroke-width', 2);

        // Draw item name
        svg.append('text')
          .attr('x', x)
          .attr('y', y - 15)
          .attr('text-anchor', 'middle')
          .attr('font-size', '10px')
          .text(item.name);
      });
    });
  }, [items, radius]);

  return <svg ref={svgRef}></svg>;
};

export default RadarChart;
