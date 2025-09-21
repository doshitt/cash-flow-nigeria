import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { X, ChevronDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CreateSavingsTargetProps {
  onClose: () => void;
}

export const CreateSavingsTarget = ({ onClose }: CreateSavingsTargetProps) => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedFrequency, setSelectedFrequency] = useState("Daily");
  const [selectedPayment, setSelectedPayment] = useState("Debit Card");
  const [agreement1, setAgreement1] = useState(false);
  const [agreement2, setAgreement2] = useState(false);

  const categories = [
    { id: "rent", label: "Rent/\nAccommodation", color: "bg-gray-500" },
    { id: "vacation", label: "Vacation/\nTravel", color: "bg-gray-500" },
    { id: "car", label: "Car/Vehicle", color: "bg-primary" }
  ];

  const frequencies = ["Daily", "Weekly", "Monthly"];
  const paymentMethods = [
    { id: "debit", label: "Debit Card", detail: "****7483" },
    { id: "flex", label: "Use Flex Card", detail: "₦1,003" }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
      <div className="bg-white w-full h-[95vh] rounded-t-3xl overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-xl font-bold">Create a personal target</h2>
            <p className="text-gray-500 text-sm">Setup a personal savings goals.Eg Rent, a Car.</p>
          </div>
          <button onClick={onClose} className="text-gray-500">
            <X size={24} />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* What are you saving for */}
          <div className="space-y-2">
            <Label className="text-gray-600">What are you saving for ?</Label>
            <Input 
              placeholder="Car" 
              className="bg-gray-100 border-0"
            />
          </div>

          {/* Category Selection */}
          <div className="space-y-2">
            <Label className="text-gray-600">Select a Category</Label>
            <div className="grid grid-cols-3 gap-3">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`${category.color} text-white p-4 rounded-xl text-sm font-medium text-center h-20 flex items-center justify-center whitespace-pre-line`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          {/* Target Amount */}
          <div className="space-y-2">
            <Label className="text-gray-600">What is your Total Target Amount ?</Label>
            <Input 
              placeholder="₦ 1,000,000"
              className="bg-gray-100 border-0"
            />
          </div>

          {/* Saving Frequency */}
          <div className="space-y-2">
            <Label className="text-gray-600">How will you prefer to save?</Label>
            <div className="grid grid-cols-3 gap-3">
              {frequencies.map((frequency) => (
                <button
                  key={frequency}
                  onClick={() => setSelectedFrequency(frequency)}
                  className={`p-3 rounded-xl text-sm font-medium ${
                    selectedFrequency === frequency
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {frequency}
                </button>
              ))}
            </div>
          </div>

          {/* Preferred Time */}
          <div className="space-y-2">
            <Label className="text-gray-600">Preferred Time</Label>
            <Select defaultValue="4:00 am">
              <SelectTrigger className="bg-gray-100 border-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="4:00 am">4:00 am</SelectItem>
                <SelectItem value="8:00 am">8:00 am</SelectItem>
                <SelectItem value="12:00 pm">12:00 pm</SelectItem>
                <SelectItem value="6:00 pm">6:00 pm</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Start Date */}
          <div className="space-y-2">
            <Label className="text-gray-600">Set start date</Label>
            <Select defaultValue="today">
              <SelectTrigger className="bg-gray-100 border-0">
                <SelectValue placeholder="Starts Today:19-Oct-2023" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Starts Today:19-Oct-2023</SelectItem>
                <SelectItem value="tomorrow">Tomorrow</SelectItem>
                <SelectItem value="custom">Custom Date</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* End Date */}
          <div className="space-y-2">
            <Label className="text-gray-600">Set end date</Label>
            <Select defaultValue="31days">
              <SelectTrigger className="bg-gray-100 border-0">
                <SelectValue placeholder="Ends in 31 days:19-Nov-2023" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="31days">Ends in 31 days:19-Nov-2023</SelectItem>
                <SelectItem value="60days">Ends in 60 days</SelectItem>
                <SelectItem value="90days">Ends in 90 days</SelectItem>
                <SelectItem value="custom">Custom Date</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Daily Contribution */}
          <div className="space-y-2">
            <Label className="text-gray-600">How much do you want to contribute daily</Label>
            <Input 
              placeholder="₦ 32,258.06"
              className="bg-gray-100 border-0"
            />
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label className="text-gray-600">How will you prefer to save?</Label>
            <div className="grid grid-cols-2 gap-3">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setSelectedPayment(method.label)}
                  className={`p-4 rounded-xl text-left ${
                    selectedPayment === method.label
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  <div className="font-medium text-sm">{method.label}</div>
                  <div className="text-xs opacity-80">{method.detail}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Agreements */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Switch
                checked={agreement1}
                onCheckedChange={setAgreement1}
                className="mt-1"
              />
              <div>
                <p className="text-sm text-gray-700">Option</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Switch
                checked={agreement2}
                onCheckedChange={setAgreement2}
                className="mt-1"
              />
              <div>
                <p className="text-sm text-gray-700">
                  I hereby agree to this: "If you break this target before the withdrawal date, you will lose all the interest accrued and bear the 1% payment gateway charge for processing your deposits into this target."
                </p>
              </div>
            </div>
          </div>

          {/* Create Target Button */}
          <Button className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-xl font-semibold text-lg">
            Create Target
          </Button>
        </div>
      </div>
    </div>
  );
};