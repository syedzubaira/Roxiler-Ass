import { Transaction } from "../models/transaction.model.js";


export const MyStatisticsData = async (req, res) => {
  const { month } = req.query;

  try {
    const saleAmount = await Transaction.aggregate([
      {
        $match: {
          dateOfSale: {
            $gte: new Date(month),
            $lt: new Date(
              new Date(month).setMonth(new Date(month).getMonth() + 1)
            ),
          },
          sold: true,
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$price" },
        },
      },
    ]);

    const unSoldItems = await Transaction.countDocuments({
      dateOfSale: {
        $gte: new Date(month),
        $lt: new Date(new Date(month).setMonth(new Date(month).getMonth() + 1)),
      },
      sold: false,
    });

    const soldItems = await Transaction.countDocuments({
      dateOfSale: {
        $gte: new Date(month),
        $lt: new Date(new Date(month).setMonth(new Date(month).getMonth() + 1)),
      },
      sold: true,
    });

    
    const slaeAmount = 0;
    if(saleAmount.length > 0){
      slaeAmount = saleAmount[0].totalAmount
    }
    res.status(200).json({
      totalSaleAmount: slaeAmount,
      soldItems,
      unSoldItems,
    });
  } catch (error) {
    console.error("Error calculating statistics data:", error);
    res.status(500).json({ error: "Failed to calculate statistics." });
  }
};

export const myTransactions = async (req, res) => {
  const { month, search, page = 1, perPage = 10 } = req.query;
  const skip = (page - 1) * perPage;
  const limit = parseInt(perPage);

  if (!month) {
    return res.status(400).json({ error: "Month parameter is required and it is missed api parameter list." });
  }

  const fromMonth = new Date(month);
  if (isNaN(fromMonth.getTime())) {
    return res.status(400).json({ error: "Invalid month format given in the api." });
  }

  const toMonth = new Date(fromMonth);
  toMonth.setMonth(fromMonth.getMonth() + 1);

  try {
    let filter = {
      dateOfSale: {
        $gte: fromMonth,
        $lt: toMonth,
      },
    };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        // { price: { $eq: parseFloat(search) } },
      ];
    }

    const totalCount = await Transaction.countDocuments(filter);

    const transactions = await Transaction.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ dateOfSale: -1 });

    res.status(200).json({
      totalCount,
      page,
      perPage,
      transactions,
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ error: "Failed to fetch transactions." });
  }
};


export const MyGetPieChartData = async (req, res) => {
  const { month } = req.query;

  try {
    const pieChartData = await Transaction.aggregate([
      {
        $match: {
          dateOfSale: {
            $gte: new Date(month),
            $lt: new Date(
              new Date(month).setMonth(new Date(month).getMonth() + 1)
            ),
          },
        },
      },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
    ]);

    const formattedChartData = pieChartData.map((entry) => ({
      category: entry._id,
      itemCount: entry.count,
    }));

    res.status(200).json(formattedChartData);
  } catch (error) {
    console.error("Error fetching pie chart data:", error);
    res.status(500).json({ error: "Failed to fetch pie chart data." });
  }
};

export const myGetBarChartData = async (req, res) => {
  const { month } = req.query;

  if (!month) {
    return res.status(400).json({ error: "Month parameter is required." });
  }

  const fromMonth = new Date(month);
  if (isNaN(fromMonth.getTime())) {
    return res.status(400).json({ error: "Invalid month format." });
  }

  const toMonth = new Date(fromMonth);
  toMonth.setMonth(fromMonth.getMonth() + 1);

  try {
    const priceRangesDict = [
      { min: 0, max: 100 },
      { min: 101, max: 200 },
      { min: 201, max: 300 },
      { min: 301, max: 400 },
      { min: 401, max: 500 },
      { min: 501, max: 600 },
      { min: 601, max: 700 },
      { min: 701, max: 800 },
      { min: 801, max: 900 },
      { min: 901, max: Infinity },
    ];

    const priceRangeData = await Promise.all(
      priceRangesDict.map(async (range) => {
        const count = await Transaction.countDocuments({
          price: { $gte: range.min, $lte: range.max },
          dateOfSale: {
            $gte: fromMonth,
            $lt: toMonth,
          },
        });
        return { range: `${range.min}-${range.max}`, count };
      })
    );

    res.status(200).json(priceRangeData);
  } catch (error) {
    console.error("Error fetching bar chart data:", error);
    res.status(500).json({ error: "Failed to fetch bar chart data." });
  }
};


