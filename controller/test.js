const Trade = require("../models/tradeSchema");

const result = async () => {
    // Trade.aggregate([
    //     {
    //         $match: {
    //             'userId': '643c22a7db2aa9e40d3fa090',
    //             'cryptoSymbol': 'BTCUSDT',
    //             'type': 'buy'
    //         }
    //     }, {
    //         $group: {
    //             '_id': null,
    //             'totalQuantityBought': {
    //                 '$sum': '$quantity'
    //             }
    //         }
    //     },
    //     //  {
    //     //     $lookup: {
    //     //         'from': 'trades',
    //     //         // 'let': {
    //     //         //     'userId': '$userId',
    //     //         //     'cryptoSymbol': '$cryptoSymbol'
    //     //         // },
    //     //         'pipeline': [
    //     //             {
    //     //                 '$match': {
    //     //                     'userId': '643c22a7db2aa9e40d3fa090',
    //     //                     'cryptoSymbol': 'BTCUSDT',
    //     //                     'type': "sell",
    //     //                 },
    //     //             }, {
    //     //                 '$group': {
    //     //                     '_id': null,
    //     //                     'totalQuantitySold': {
    //     //                         '$sum': '$quantity'
    //     //                     }
    //     //                 }
    //     //             }
    //     //         ],
    //     //         as: 'sells'
    //     //     }
    //     // },
    //     // {
    //     //     $addFields: {
    //     //         'totalQuantitySold': {
    //     //             '$sum': '$sells.totalQuantitySold'
    //     //         },
    //     //         remainingQuantity: {
    //     //             '$subtract': [
    //     //                 '$totalQuantityBought', {
    //     //                     '$ifNull': [
    //     //                         {
    //     //                             '$sum': '$totalQuantitySold'
    //     //                         },
    //     //                         0
    //     //                     ]
    //     //                 }
    //     //             ]
    //     //         }
    //     //     }
    //     // }, {
    //     //     $project: {
    //     //         '_id': 0,
    //     //         'remainingQuantity': 1
    //     //     }
    //     // }
    // ]);
    try {
        const res = await Trade.aggregate([
            {
                '$match':
                {
                    'userId': "643c22a7db2aa9e40d3fa090",
                    'cryptoSymbol': "BTCUSDT",
                    'type': "buy",
                },
            },
            {
                '$group':
                {
                    _id: null,
                    totalQuantityBought: {
                        $sum: "$quantity",
                    },
                },
            },
            {
                $lookup:
                {
                    from: "trades",
                    pipeline: [
                        {
                            $match: {
                                userId: "643c22a7db2aa9e40d3fa090",
                                cryptoSymbol: "BTCUSDT",
                                type: "sell",
                            },
                        },
                        {
                            $group: {
                                _id: null,
                                totalQuantitySold: {
                                    $sum: "$quantity",
                                },
                            },
                        },
                    ],
                    as: "sells",
                },
            },
            {
                $addFields:
                {
                    totalQuantitySold: {
                        $sum: "$sells.totalQuantitySold",
                    },
                    remainingQuantity: {
                        $subtract: [
                            "$totalQuantityBought",
                            {
                                $ifNull: [
                                    {
                                        $sum: "$sells.totalQuantitySold",
                                    },
                                    0,
                                ],
                            },
                        ],
                    },
                },
            },
            {
                $project:
                {
                    _id: 0,
                    remainingQuantity: 1,
                },
            },
        ]);


        console.log("res : ...\n" + res);
    }
    catch (err) {
        console.log(err);
    }
}

result();

