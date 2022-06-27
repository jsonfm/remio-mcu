import json


class Variables:
    """A variables dictionary with some extra functionalities, like state backup.
    
    Args:
        variables: a dictionary with variables.
    Example:
        variables = Variable({
            'var1': 1, # type: int
            'var2': 3.14 # type: float
            'var3': 'active' # type: str
            'var4': False, # type: bool
        })
    """
    def __init__(self, variables: dict = {}):
        self.variables = variables
        self.backup = variables.copy()
        self.updatedStatus = False

    def __len__(self):
        return len(self.variables)

    def __str__(self):
        return str(self.variables)
    
    def __getitem__(self, key):
        return self.variables[key]
    
    def __setitem__(self, key: str, value):
        self.variables[key] = value

    def restore(self):
        """Restores the variables backup."""
        self.variables = self.backup.copy()

    def set(self, key: str, value, backup=True):
        """Updates a variable value"""
        if backup:
            self.backup = self.variables.copy()
        self.variables[key] = value
    
    def get(self, key: str):
        """Returns a specific variable value."""
        return self.variables[key]

    def values(self):
        """Get the variables values on dict format."""
        return self.variables

    def json(self):
        """Returns the variables dict as JSON string."""
        return json.dumps(self.variables)

    def update(self, data: str):
        """Updates the variables values."""
        if isinstance(data, str):
            data = json.loads(data)
        self.variables = data
        self.backup = dict(self.variables)
        self.setUpdated(True)

    def setUpdated(self, value: bool):
        """Updates the updated status."""
        self.updatedStatus = value
    
    def updated(self):
        """Returns the updated status."""
        return self.updatedStatus