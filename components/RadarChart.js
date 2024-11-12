// components/RadarChart.js - adding color

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

    // Function to set color based on impact
    const getColorByImpact = (impact) => {
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

    // Function to set size based on cost
    const getSizeByCost = (cost) => {
      switch (cost) {
        case 'low':
          return 7; // 70% of default size (10)
        case 'medium':
          return 10; // Default size
        case 'high':
          return 15; // 150% of default size
        default:
          return 10;
      }
    };

    // Position items in each category quadrant based on distance
    Object.entries(groupedItems).forEach(([key, items]) => {
      const [category, distance] = key.split('-');
      const angleOffset = (Math.PI / 2) * (parseInt(category.replace('cat', '')) - 1);
      const distRadius = distanceToRadius[distance] || radius;

      // Calculate equal-angle spacing for items at the same distance
      const angleStep = (Math.PI / 2) / (items.length + 1);
      items.forEach((item, index) => {
        const angle = angleOffset + angleStep * (index + 1);
        const x = distRadius * Math.cos(angle);
        const y = distRadius * Math.sin(angle);

        // Set color, size, and glow effect based on item properties
        const color = getColorByImpact(item.impact);
        const size = getSizeByCost(item.cost);

        // Append group for each item to manage glow effect if type is "opportunity"
        const itemGroup = svg.append('g');

        if (item.type === 'opportunity') {
          // Apply glow effect for opportunities
          itemGroup.append('circle')
            .attr('cx', x)
            .attr('cy', y)
            .attr('r', size + 5) // Slightly larger circle for glow
            .attr('fill', color)
            .attr('opacity', 0.3);
        }

        // Draw main item circle
        itemGroup.append('circle')
          .attr('cx', x)
          .attr('cy', y)
          .attr('r', size)
          .attr('fill', color)
          .attr('stroke', 'white')
          .attr('stroke-width', 2);

        // Draw item name
        svg.append('text')
          .attr('x', x)
          .attr('y', y - size - 5)
          .attr('text-anchor', 'middle')
          .attr('font-size', '10px')
          .attr('fill', '#333')
          .text(item.name);
      });
    });
  }, [items, radius]);

  return <svg ref={svgRef}></svg>;
};

export default RadarChart;
