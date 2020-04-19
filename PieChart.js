/* eslint-disable no-shadow */
/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable func-names */
/* eslint-disable react/no-this-in-sfc */
/* eslint-disable no-cond-assign */
import React, { useState } from 'react';
import { withRouter } from 'next/router';

const PieChart = props => {
  const { data } = props;

  const names = [...data].map(item => item.name);

  const [firstTime, changeTime] = useState(true);

  const colors = [...data].map(item => item.color);

  const totalCounts = [...data]
    .map(item => item.counts)
    .reduce((total, value) => total + value);
  const [percents, updatePercents] = useState(
    [...data].map(item => item.counts / totalCounts)
  );
  // List of Angles
  const angles = [...percents].map(percent => 2 * Math.PI * percent);
  // Temporary variables, to store each arc angles
  let beginAngle = 0;
  let endAngle = 0;

  const listArcs = [];

  for (let i = 0; i < angles.length; i += 1) {
    beginAngle = endAngle;
    endAngle += angles[i];
    listArcs[i] = {
      x: 500,
      y: 500,
      r: 200,
      beginAngle,
      endAngle,
      color: colors[i % colors.length],
      name: names[i % names.length],
      count: data[i % data.length].counts,
      percent: (percents[i % percents.length] * 100).toFixed(2)
    };
  }

  let r;
  let i = 0;

  const drawChart = () => {
    setTimeout(() => {
      const canvas = document.getElementById('myCanvas');
      const ctx = canvas.getContext('2d');

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Iterate through the angles
      while ((r = listArcs[i++])) {
        ctx.beginPath();
        // Fill color
        ctx.fillStyle = r.color;

        // Same code as before
        ctx.moveTo(r.x, r.y);
        ctx.arc(r.x, r.y, r.r, r.beginAngle, r.endAngle);
        ctx.lineTo(r.x, r.y);
        ctx.stroke();

        // Fill
        ctx.fill();
      }

      if (firstTime) {
        canvas.onclick = function(e) {
          setInterval(() => {
            const temp = percents.slice(0);
            temp[0] += 0.01;
            temp[1] -= 0.01;
            updatePercents(temp);
          }, 50);
        };
      }

      if (firstTime) {
        canvas.onmousemove = function(e) {
          const rect = this.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          let i = 0;
          let r = 0;
          let realX = x * (canvas.width / (rect.right - rect.left));
          let realY = y * (canvas.height / (rect.bottom - rect.top));

          ctx.clearRect(0, 0, canvas.width, canvas.height);

          while ((r = listArcs[i++])) {
            realX = x * (canvas.width / (rect.right - rect.left));
            realY = y * (canvas.height / (rect.bottom - rect.top));
            ctx.beginPath();
            ctx.globalCompositeOperation = 'destination-over';
            ctx.moveTo(r.x, r.y);
            ctx.arc(r.x, r.y, r.r, r.beginAngle, r.endAngle);
            ctx.lineTo(r.x, r.y);
            ctx.stroke();
            ctx.fillStyle = r.color;
            ctx.fill();
            if (ctx.isPointInPath(realX, realY)) {
              ctx.globalCompositeOperation = 'source-over';
              ctx.beginPath();
              ctx.moveTo(realX, realY);
              ctx.lineTo(realX + r.r, realY - r.r);
              ctx.lineTo(realX + r.r + 150, realY - r.r);
              ctx.stroke();
              ctx.font = '30px Roboto';
              ctx.textAlign = 'right';
              ctx.fillText(
                `${r.name} ${r.percent}% (${r.count}) `,
                realX + r.r + 150,
                realY - r.r - 10
              );
            }
          }
        };

        changeTime(false);
      }
    }, 0);
  };

  drawChart();

  return (
    <canvas
      id="myCanvas"
      className="myCanvas"
      width="1000"
      height="1000"
      style={{ border: '1px solid #c3c3c3' }}
    />
  );
};

export default withRouter(PieChart);
