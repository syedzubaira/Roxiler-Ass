import express from "express";
import {
  myStatisticsData,
  myTransactions,
  myGetPieChartData,
  myGetBarChartData,
} from "../controllers/apiController.js";

const apiRouter = express.Router();

apiRouter.route("/statistics").get(myStatisticsData);
apiRouter.route("/transactions").get(myTransactions);
apiRouter.route("/pie").get(myGetPieChartData);
apiRouter.route("/bar").get(myGetBarChartData);

export { apiRouter };
