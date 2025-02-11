import { Link } from "react-router-dom";

export default function NavBar() {
  return (
    <nav className="flex justify-between items-center p-2 bg-blue-600 text-white">
      <div className="flex items-center">
        {/* <div className="mr-2 font-bold">Logo</div> */}
        <Link to='/'className="font-bold">LLM Prompt Helper</Link>
      </div>
      <div className="space-x-4">
        <Link to="/prompts">My Prompts</Link>
        {/* <Link to="/help">Help</Link> */}
      </div>
    </nav>
  );
}