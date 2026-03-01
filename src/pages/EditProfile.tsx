import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ArrowLeft, Edit } from "lucide-react";

const EditProfile = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        bio: "",
        location: "",
        website: "",
        github: "",
        linkedin: "",
        avatar: "",
    });

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/signin");
                return;
            }

            try {
                const response = await fetch("https://mlcode-snkb.onrender.com/api/auth/me", {
                    headers: { "auth-token": token },
                });
                const data = await response.json();
                if (response.ok) {
                    setFormData({
                        name: data.name || "",
                        bio: data.bio || "",
                        location: data.location || "",
                        website: data.socials?.website || "",
                        github: data.socials?.github || "",
                        linkedin: data.socials?.linkedin || "",
                        avatar: data.avatar || "",
                    });
                }
            } catch (error) {
                toast.error("Failed to load profile data");
            }
        };
        fetchUser();
    }, [navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setFormData((prev) => ({ ...prev, avatar: base64String }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const token = localStorage.getItem("token");

        // Payload size check - warn if too large (optional but good practice)
        if (formData.avatar.length > 5 * 1024 * 1024) { // > 5MB approximation
            toast.error("Image size too large, please pick a smaller image");
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch("https://mlcode-snkb.onrender.com/api/auth/me", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "auth-token": token || "",
                },
                body: JSON.stringify({
                    name: formData.name,
                    bio: formData.bio,
                    location: formData.location,
                    avatar: formData.avatar,
                    socials: {
                        website: formData.website,
                        github: formData.github,
                        linkedin: formData.linkedin,
                    },
                }),
            });

            if (response.ok) {
                toast.success("Profile updated successfully!");
                // Notify other components (like Navbar) to refresh user data
                window.dispatchEvent(new Event("userUpdated"));
                navigate("/profile");
            } else {
                throw new Error("Failed to update profile");
            }
        } catch (error) {
            toast.error("Failed to update profile");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="mx-auto max-w-2xl px-4 py-8">
            <Button variant="ghost" className="mb-6 pl-0 hover:bg-transparent hover:text-primary" onClick={() => navigate("/profile")}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Profile
            </Button>

            <div className="glass-card p-8">
                <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex flex-col items-center justify-center mb-6">
                        <div className="relative group cursor-pointer">
                            <div className="h-24 w-24 rounded-full bg-primary/20 flex items-center justify-center text-4xl font-bold text-primary overflow-hidden border-2 border-border">
                                {formData.avatar ? <img src={formData.avatar} alt="Preview" className="h-full w-full object-cover" /> : formData.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Edit className="h-6 w-6 text-white" />
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={handleImageUpload}
                            />
                        </div>
                        <span className="text-sm text-muted-foreground mt-2">Click to change avatar</span>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="name">Display Name</Label>
                        <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea id="bio" name="bio" value={formData.bio} onChange={handleChange} placeholder="Tell us about yourself" className="resize-none h-24" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input id="location" name="location" value={formData.location} onChange={handleChange} placeholder="e.g. San Francisco, CA" />
                    </div>

                    <div className="space-y-4 pt-4 border-t border-border/50">
                        <h2 className="font-semibold">Social Links</h2>

                        <div className="space-y-2">
                            <Label htmlFor="website">Website</Label>
                            <Input id="website" name="website" value={formData.website} onChange={handleChange} placeholder="https://your-website.com" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="github">GitHub URL</Label>
                            <Input id="github" name="github" value={formData.github} onChange={handleChange} placeholder="https://github.com/username" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="linkedin">LinkedIn URL</Label>
                            <Input id="linkedin" name="linkedin" value={formData.linkedin} onChange={handleChange} placeholder="https://linkedin.com/in/username" />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-4">
                        <Button type="button" variant="outline" onClick={() => navigate("/profile")}>Cancel</Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfile;
