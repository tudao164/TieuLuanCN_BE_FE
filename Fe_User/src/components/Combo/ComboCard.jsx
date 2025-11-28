// src/components/Combo/ComboCard.jsx
import { useState } from "react";
import { Card, CardContent } from "./Card";

export default function ComboCard({ combo, onQuantityChange, compact = false }) {
    const [quantity, setQuantity] = useState(0);

    const handleIncrease = () => {
        const newQty = quantity + 1;
        setQuantity(newQty);
        onQuantityChange(combo.comboID, newQty);
    };

    const handleDecrease = () => {
        const newQty = Math.max(quantity - 1, 0);
        setQuantity(newQty);
        onQuantityChange(combo.comboID, newQty);
    };

    if (compact) {
        return (
            <div className="border border-gray-600 bg-gray-800/50 rounded-xl p-3 hover:border-gray-500 transition-colors">
                <div className="flex justify-between items-center mb-2">
                    <div className="flex-1">
                        <h2 className="text-sm font-semibold text-white">{combo.nameCombo}</h2>
                        <p className="text-gray-400 text-xs mt-1">{combo.description}</p>
                    </div>
                    <span className="text-sm font-bold text-red-400 ml-2">
                        {(combo.price || 0).toLocaleString()}VND
                    </span>
                </div>

                <div className="flex justify-between items-center">
                    <div className="flex items-center border border-gray-600 rounded-lg overflow-hidden bg-white">
                        <button
                            onClick={handleDecrease}
                            disabled={quantity === 0}
                            className="px-2 py-1 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 text-black text-xs w-6 h-6 flex items-center justify-center"
                        >
                            -
                        </button>
                        <span className="px-2 py-1 bg-white text-black font-medium text-xs w-6 text-center">
                            {quantity}
                        </span>
                        <button
                            onClick={handleIncrease}
                            className="px-2 py-1 bg-gray-200 hover:bg-gray-300 text-black text-xs w-6 h-6 flex items-center justify-center"
                        >
                            +
                        </button>
                    </div>

                    <button
                        onClick={handleIncrease}
                        className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-xs font-medium"
                    >
                        Thêm
                    </button>
                </div>
            </div>
        );
    }

    return (
        <Card className="mb-4 border border-gray-600 bg-gray-800/50">
            <CardContent className="p-4 text-left">
                <div className="flex justify-between items-center mb-3">
                    <h2 className="text-lg font-bold text-white">{combo.nameCombo}</h2>
                    <span className="text-lg font-bold text-red-400">
                        {(combo.price || 0).toLocaleString()}VND
                    </span>
                </div>

                <div className="flex justify-between items-center">
                    <div className="flex items-center border border-gray-600 rounded-lg overflow-hidden bg-white">
                        <button
                            onClick={handleDecrease}
                            disabled={quantity === 0}
                            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 text-black font-bold"
                        >
                            -
                        </button>
                        <span className="px-4 py-1 bg-white text-black font-bold min-w-12 text-center">
                            {quantity}
                        </span>
                        <button
                            onClick={handleIncrease}
                            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-black font-bold"
                        >
                            +
                        </button>
                    </div>

                    <button
                        onClick={handleIncrease}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                    >
                        Thêm vào giỏ
                    </button>
                </div>
            </CardContent>
        </Card>
    );
}