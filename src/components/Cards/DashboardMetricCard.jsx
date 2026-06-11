import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import PropTypes from "prop-types";
import { Card, CardContent, Typography } from "@material-ui/core";

const useStyles = makeStyles(() => ({
  card: {
    borderRadius: 16,
    padding: "16px",
    boxShadow: "0px 2px 10px rgba(0,0,0,0.07)",
    width: "100%"
  },
  title: {
    fontSize: 14,
    fontWeight: 500,
    marginBottom: 16,
    color: "#000",
  },
  value: {
    fontSize: 24,
    fontWeight: 700,
    color: "#000",
    marginBottom: 12,
  },
  change: {
    fontSize: 10,
    fontWeight: 500,
  },
}));

export const DashboardMetricCard = ({
  title,
  value,
  change,
  changeColor = "#1A8F3A",
}) => {
  const classes = useStyles();

  return (
    <>
      <Card className={classes.card}>
        <CardContent>
          <Typography className={classes.title}>{title}</Typography>

          <Typography className={classes.value}>{value}</Typography>

          {change && (
            <Typography
              className={classes.change}
              style={{ color: changeColor }}
            >
              {change}
            </Typography>
          )}
        </CardContent>
      </Card>
    </>
  );
};

DashboardMetricCard.propTypes = {
  title: PropTypes.string,
  value: PropTypes.string,
  change: PropTypes.string,
  changeColor: PropTypes.string,
};
