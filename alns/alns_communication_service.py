import os
import logging
import traceback
from typing import Dict, Any, List

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.FileHandler("alns_debug.log"), logging.StreamHandler()]
)
logger = logging.getLogger("alns-service")

class ALNSCommunicationService:
    """Service to handle communication and debugging for ALNS operations"""
    
    @staticmethod
    def log_environment():
        """Log information about the environment"""
        logger.info("Environment variables:")
        for var, value in os.environ.items():
            if "PATH" in var or "path" in var:
                logger.info(f"  {var}: (path variable)")
            else:
                logger.info(f"  {var}: {value}")
        
        logger.info(f"Current working directory: {os.getcwd()}")
        logger.info(f"Directory contents: {os.listdir('.')}")
    
    @staticmethod
    def log_request_info(files_info: List[Dict]):
        """Log information about the incoming request files"""
        logger.info(f"Received {len(files_info)} files:")
        for file_info in files_info:
            logger.info(f"  - {file_info.get('filename', 'unnamed')} ({file_info.get('content_type', 'unknown type')})")
    
    @staticmethod
    def log_exception(e: Exception, context: str = ""):
        """Log detailed exception information"""
        logger.error(f"Exception in {context or 'ALNS process'}: {str(e)}")
        logger.error(traceback.format_exc())
    
    @staticmethod
    def debug_file_contents(filepath: str, max_lines: int = 20):
        """Debug file contents"""
        try:
            if os.path.exists(filepath):
                logger.info(f"Contents of {filepath} (first {max_lines} lines):")
                with open(filepath, 'r') as f:
                    for i, line in enumerate(f):
                        if i >= max_lines:
                            logger.info("... (truncated)")
                            break
                        logger.info(f"  {i+1}: {line.rstrip()}")
            else:
                logger.warning(f"File not found: {filepath}")
        except Exception as e:
            logger.error(f"Error reading file {filepath}: {str(e)}")
    
    @staticmethod
    def debug_directory_structure(path: str, depth: int = 2):
        """Debug directory structure"""
        def explore_dir(dir_path: str, current_depth: int = 0):
            if current_depth > depth:
                return ["..."]
            
            try:
                items = os.listdir(dir_path)
                result = []
                for item in items:
                    item_path = os.path.join(dir_path, item)
                    if os.path.isdir(item_path):
                        sub_items = explore_dir(item_path, current_depth + 1)
                        result.append(f"{item}/ ({len(sub_items)} items)")
                    else:
                        result.append(item)
                return result
            except Exception as e:
                return [f"Error: {str(e)}"]
        
        structure = explore_dir(path)
        logger.info(f"Directory structure of {path}:")
        for item in structure:
            logger.info(f"  {item}")
