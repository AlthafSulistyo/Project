import { Camera, Bell, Shield, Users, Database, Clock } from 'lucide-react';

export function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl text-white mb-2">System Settings</h1>
        <p className="text-gray-400">Configure your security system preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#0f1420] border border-gray-800 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="size-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <Camera className="size-6 text-white" />
            </div>
            <div>
              <h3 className="text-white">Camera Settings</h3>
              <p className="text-gray-400 text-sm">Configure camera parameters</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-800">
              <div>
                <div className="text-white text-sm">Camera Resolution</div>
                <div className="text-gray-400 text-xs">Current: 1080p</div>
              </div>
              <select className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600">
                <option>720p</option>
                <option>1080p</option>
                <option>4K</option>
              </select>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-800">
              <div>
                <div className="text-white text-sm">Frame Rate</div>
                <div className="text-gray-400 text-xs">Frames per second</div>
              </div>
              <select className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600">
                <option>15 fps</option>
                <option>30 fps</option>
                <option>60 fps</option>
              </select>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <div className="text-white text-sm">Night Vision</div>
                <div className="text-gray-400 text-xs">Automatic IR activation</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        <div className="bg-[#0f1420] border border-gray-800 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="size-12 bg-red-600 rounded-lg flex items-center justify-center">
              <Bell className="size-6 text-white" />
            </div>
            <div>
              <h3 className="text-white">Alert Settings</h3>
              <p className="text-gray-400 text-sm">Manage notification preferences</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-800">
              <div>
                <div className="text-white text-sm">Email Notifications</div>
                <div className="text-gray-400 text-xs">Receive alerts via email</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-800">
              <div>
                <div className="text-white text-sm">SMS Alerts</div>
                <div className="text-gray-400 text-xs">Urgent alerts only</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <div className="text-white text-sm">Sound Alerts</div>
                <div className="text-gray-400 text-xs">Play audio for critical events</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        <div className="bg-[#0f1420] border border-gray-800 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="size-12 bg-green-600 rounded-lg flex items-center justify-center">
              <Shield className="size-6 text-white" />
            </div>
            <div>
              <h3 className="text-white">Security Settings</h3>
              <p className="text-gray-400 text-sm">Configure detection parameters</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="py-3 border-b border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <div className="text-white text-sm">Motion Sensitivity</div>
                <div className="text-blue-400 text-sm">75%</div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                defaultValue="75"
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-800">
              <div>
                <div className="text-white text-sm">Intrusion Detection</div>
                <div className="text-gray-400 text-xs">AI-powered detection</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <div className="text-white text-sm">Facial Recognition</div>
                <div className="text-gray-400 text-xs">Identify known individuals</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        <div className="bg-[#0f1420] border border-gray-800 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="size-12 bg-purple-600 rounded-lg flex items-center justify-center">
              <Database className="size-6 text-white" />
            </div>
            <div>
              <h3 className="text-white">Storage Settings</h3>
              <p className="text-gray-400 text-sm">Manage recording storage</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-800">
              <div>
                <div className="text-white text-sm">Retention Period</div>
                <div className="text-gray-400 text-xs">Keep recordings for</div>
              </div>
              <select className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600">
                <option>7 days</option>
                <option>14 days</option>
                <option>30 days</option>
                <option>90 days</option>
              </select>
            </div>

            <div className="py-3 border-b border-gray-800">
              <div className="text-white text-sm mb-2">Storage Usage</div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '48%' }}></div>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-gray-400 text-xs">234 GB used</span>
                <span className="text-gray-400 text-xs">500 GB total</span>
              </div>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <div className="text-white text-sm">Auto-Delete Old Files</div>
                <div className="text-gray-400 text-xs">Manage storage automatically</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors">
          Cancel
        </button>
        <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
          Save Changes
        </button>
      </div>
    </div>
  );
}
