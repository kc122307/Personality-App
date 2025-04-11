import { useAuth } from "../contexts/AuthContext";

const ProfileCard = () => {
  const { user } = useAuth();
  
  if (!user) return null;
  
  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-8">
        <div className="flex items-center mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-green-400 to-teal-600 flex items-center justify-center text-white text-3xl">
            {user.username?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="ml-6">
            <h2 className="text-3xl font-bold text-gray-800">
              {user.username || "User"}
            </h2>
            <p className="text-gray-600 mt-1">{user.email}</p>
          </div>
        </div>
        
        <div className="border-t pt-6">
          <dl>
            <div>
              <dt className="text-sm font-medium text-gray-500">Account Created</dt>
              <dd className="mt-1 text-gray-900">
                {new Date(user.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;