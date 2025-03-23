import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

const data = {
  nodes: [
    { id: 'OG Kush', group: 'Hybrid', link: 'https://oregoncc.io/example-farms/og-kush', isParent: true, farm: 'Example Farms' },
    { id: 'Chemdawg', group: 'Hybrid', link: 'https://oregoncc.io/example-farms/chemdawg', farm: 'Example Farms' },
    { id: 'Hindu Kush', group: 'Indica', link: 'https://oregoncc.io/example-farms/hindu-kush', farm: 'Example Farms' },
    { id: 'Girl Scout Cookies', group: 'Hybrid', link: 'https://oregoncc.io/example-farms/girl-scout-cookies', isParent: true, farm: 'Example Farms' },
    { id: 'Durban Poison', group: 'Sativa', link: 'https://oregoncc.io/example-farms/durban-poison', farm: 'Example Farms' },
    { id: 'Blue Dream', group: 'Hybrid', link: 'https://oregoncc.io/example-farms/blue-dream', isParent: true, farm: 'Example Farms' },
    { id: 'Purple Haze', group: 'Sativa', link: 'https://oregoncc.io/example-farms/purple-haze', farm: 'Example Farms' },
    { id: 'White Widow', group: 'Hybrid', link: 'https://oregoncc.io/example-farms/white-widow', farm: 'Example Farms' },
    { id: 'Tangie', group: 'Sativa', link: 'https://oregoncc.io/example-farms/tangie', farm: 'Example Farms' },
    { id: 'Garlic Breath', group: 'Indica', link: 'https://oregoncc.io/example-farms/garlic-breath', farm: 'Example Farms' },
    { id: 'Headband', group: 'Hybrid', link: 'https://oregoncc.io/example-farms/headband', farm: 'Example Farms' },
    { id: 'Jack Herer', group: 'Sativa', link: 'https://oregoncc.io/example-farms/jack-herer', isParent: true, farm: 'Example Farms' },
    { id: 'Blueberry Muffin', group: 'Indica', link: 'https://oregoncc.io/example-farms/blueberry-muffin', farm: 'Example Farms' },
    { id: 'Wedding Cake', group: 'Hybrid', link: 'https://oregoncc.io/example-farms/wedding-cake', farm: 'Example Farms' },
    { id: 'Bruce Banner', group: 'Hybrid', link: 'https://oregoncc.io/example-farms/bruce-banner', farm: 'Example Farms' },
    { id: 'MAC 1', group: 'Hybrid', link: 'https://oregoncc.io/example-farms/mac-1', farm: 'Example Farms' }
  ],
  links: [
    { source: 'Chemdawg', target: 'OG Kush' },
    { source: 'Hindu Kush', target: 'OG Kush' },
    { source: 'OG Kush', target: 'Girl Scout Cookies' },
    { source: 'Durban Poison', target: 'Girl Scout Cookies' },
    { source: 'Blue Dream', target: 'Purple Haze' },
    { source: 'White Widow', target: 'Blue Dream' },
    { source: 'Tangie', target: 'Jack Herer' },
    { source: 'Garlic Breath', target: 'Headband' },
    { source: 'Headband', target: 'Wedding Cake' },
    { source: 'Jack Herer', target: 'Bruce Banner' },
    { source: 'Blueberry Muffin', target: 'MAC 1' }
  ]
};

const StrainLineageMap = () => {
  const svgRef = useRef();
  const gRef = useRef();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    const zoom = d3.zoom().on('zoom', (event) => {
      d3.select(gRef.current).attr('transform', event.transform);
    });

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .style('background-color', '#111')
      .call(zoom);

    const g = d3.select(gRef.current);

    const color = d3.scaleOrdinal()
      .domain(['Indica', 'Sativa', 'Hybrid'])
      .range(['#8e44ad', '#27ae60', '#f39c12']);

    const simulation = d3.forceSimulation(data.nodes)
      .force('link', d3.forceLink(data.links).id(d => d.id).distance(180))
      .force('charge', d3.forceManyBody().strength(-600))
      .force('center', d3.forceCenter(width / 2, height / 2));

    const link = g.selectAll('.link')
      .data(data.links)
      .enter().append('line')
      .attr('stroke', '#444')
      .attr('stroke-width', 2);

    const node = g.selectAll('.node')
      .data(data.nodes)
      .enter().append('circle')
      .attr('r', d => d.isParent ? 26 : 18)
      .attr('fill', d => color(d.group))
      .attr('stroke', d => d.isParent ? '#fff' : '#000')
      .attr('stroke-width', d => d.isParent ? 3 : 1)
      .on('click', (event, d) => window.open(d.link, '_blank'))
      .call(drag(simulation));

    const text = g.selectAll('.text')
      .data(data.nodes)
      .enter()
      .append('g')
      .each(function(d) {
        const group = d3.select(this);
        group.append('text')
          .text(d.id)
          .attr('font-size', '16px')
          .attr('fill', '#f2f2f2')
          .attr('dx', 36)
          .attr('dy', -6);

        if (d.farm === 'Example Farms') {
          group.append('a')
            .attr('href', d.link)
            .attr('target', '_blank')
            .append('text')
            .text(`From ${d.farm}`)
            .attr('font-size', '12px')
            .attr('fill', '#bbb')
            .attr('text-decoration', 'underline')
            .attr('dx', 36)
            .attr('dy', 14);
        }
      });

    simulation.on('tick', () => {
      link.attr('x1', d => d.source.x)
          .attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x)
          .attr('y2', d => d.target.y);

      node.attr('cx', d => d.x)
          .attr('cy', d => d.y);

      text.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    setTimeout(() => simulation.stop(), 3000);

    function drag(simulation) {
      return d3.drag()
        .on('start', event => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          event.subject.fx = event.subject.x;
          event.subject.fy = event.subject.y;
        })
        .on('drag', event => {
          event.subject.fx = event.x;
          event.subject.fy = event.y;
        })
        .on('end', event => {
          if (!event.active) simulation.alphaTarget(0);
          event.subject.fx = null;
          event.subject.fy = null;
        });
    }
  }, []);

  useEffect(() => {
    if (!searchTerm) return;

    const match = data.nodes.find(n => n.id.toLowerCase().includes(searchTerm.toLowerCase()));
    if (match && match.x !== undefined && match.y !== undefined) {
      const svg = d3.select(svgRef.current);
      const width = window.innerWidth;
      const height = window.innerHeight;

      const zoom = d3.zoom().on('zoom', (event) => {
        d3.select(gRef.current).attr('transform', event.transform);
      });

      svg.transition()
        .duration(750)
        .call(zoom.transform, d3.zoomIdentity.translate(width / 2 - match.x, height / 2 - match.y).scale(1));
    }
  }, [searchTerm]);

  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#111', position: 'relative' }}>
      <input
        type="text"
        placeholder="Search strain..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          zIndex: 10,
          padding: '8px',
          fontSize: '16px',
          borderRadius: '4px',
          border: '1px solid #888'
        }}
      />
      <svg ref={svgRef}>
        <g ref={gRef}></g>
      </svg>
    </div>
  );
};

export default StrainLineageMap;
